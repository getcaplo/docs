// Renders the `caplo docs export` command tree as one Markdown page per top-level command.

import { slug } from './schema-markdown.mjs';

const escapeText = (text) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cell = (text) => escapeText(text).replace(/\|/g, '\\|').replace(/\n+/g, ' ');

/** Help text is plain text: blank lines split paragraphs, and indented lines stay as code. */
function prose(text) {
	return text
		.split(/\n{2,}/)
		.map((block) => {
			const lines = block.split('\n');
			if (lines.every((line) => /^(\s{2,}|\t)/.test(line))) {
				return '```sh\n' + lines.map((line) => line.replace(/^(\s{2}|\t)/, '')).join('\n') + '\n```';
			}
			if (lines.every((line) => /^\s*[-*] /.test(line))) return lines.map(escapeText).join('\n');
			return escapeText(lines.join(' ').replace(/\s+/g, ' ').trim());
		})
		.join('\n\n');
}

const sentence = (text) => (/[.!?]$/.test(text) ? text : `${text}.`);

function example(text) {
	// Cobra examples are indented; the export trims the first line, so measure the indent on the others.
	const lines = text.split('\n');
	const rest = lines.slice(1).filter((l) => l.trim());
	const indent = rest.length ? Math.min(...rest.map((l) => l.match(/^\s*/)[0].length)) : 0;
	return '```sh\n' + lines.map((l, i) => (i === 0 ? l.trimStart() : l.slice(Math.min(indent, l.match(/^\s*/)[0].length)))).join('\n') + '\n```';
}

function flagTable(flags) {
	const rows = flags.map((f) => {
		const name = `\`--${f.name}\`` + (f.shorthand ? `, \`-${f.shorthand}\`` : '');
		const type = f.type === 'bool' ? '' : f.type;
		return `| ${name} | ${type} | ${f.default ? `\`${cell(f.default)}\`` : ''} | ${cell(f.usage)} |`;
	});
	return ['| Flag | Value | Default | Description |', '| --- | --- | --- | --- |', ...rows].join('\n');
}

// The page's own command is its introduction; every other command gets a heading.
function commandSection(cmd, intro = false) {
	const parts = intro ? [sentence(escapeText(cmd.short))] : [`## ${cmd.path}`, '', sentence(escapeText(cmd.short))];
	parts.push('', '```sh', cmd.use, '```');
	if (cmd.aliases?.length) parts.push('', `Aliases: ${cmd.aliases.map((a) => `\`${a}\``).join(', ')}`);
	if (cmd.long) parts.push('', prose(cmd.long));
	if (cmd.example) parts.push('', '**Examples**', '', example(cmd.example));
	const flags = cmd.flags ?? [];
	if (flags.length) parts.push('', '**Flags**', '', flagTable(flags));
	if (cmd.subcommands?.length && !cmd.runnable) {
		parts.push('', '**Commands**', '', ...cmd.subcommands.map((s) => `- [\`${s}\`](#${slug(s)})`));
	}
	return parts.join('\n');
}

const frontmatter = (title, description, order, label) =>
	['---', `title: ${JSON.stringify(title)}`, `description: ${JSON.stringify(description)}`, 'editUrl: false', 'sidebar:', `  order: ${order}`, ...(label ? [`  label: ${JSON.stringify(label)}`] : []), '---', ''].join('\n');

const banner = (version, help) =>
	`:::note[Generated reference]\nGenerated from \`caplo\` ${version}, the latest release. \`${help}\` prints the same text.\n:::\n`;

/** Returns a map of file name (under reference/cli/) to Markdown. */
export function renderCli(exported) {
	const byPath = new Map(exported.commands.map((c) => [c.path, c]));
	const root = byPath.get('caplo');
	const top = root.subcommands.map((p) => byPath.get(p));
	const subtree = (cmd) => [cmd, ...(cmd.subcommands ?? []).flatMap((p) => subtree(byPath.get(p)))];
	const version = `v${exported.version}`;
	const files = {};

	const project = top.filter((c) => c.group === 'Project');
	const groups = top.filter((c) => c.group && c.group !== 'Project');
	const other = top.filter((c) => !c.group);

	const pageLink = (c) => (c.group === 'Project' ? `/reference/cli/project/#${slug(c.path)}` : c.group ? `/reference/cli/${c.path.split(' ')[1]}/` : `/reference/cli/#${slug(c.path)}`);
	const commandList = (title, list) => [`### ${title}`, '', '| Command | Description |', '| --- | --- |', ...list.map((c) => `| [\`${c.path}\`](${pageLink(c)}) | ${cell(c.short)} |`)].join('\n');

	const globalFlags = [...(root.flags ?? [])];
	files['index.md'] = [
		frontmatter('CLI reference', 'Every caplo command, flag, environment variable and exit code, generated from the released CLI.', 0, 'Overview'),
		banner(version, 'caplo --help'),
		'Install the CLI with the [installation guide](/cli/install/). Task guides are under [CLI](/cli/workflow/).',
		'',
		'```sh',
		root.use,
		'```',
		'',
		'## Commands',
		'',
		commandList('Project', project),
		'',
		...[...new Set(groups.map((c) => c.group))].flatMap((g) => [commandList(g, groups.filter((c) => c.group === g)), '']),
		commandList('Other', other),
		'',
		'## Global flags',
		'',
		'These flags work with every command.',
		'',
		flagTable(globalFlags),
		'',
		'## Environment variables',
		'',
		'| Variable | Description |',
		'| --- | --- |',
		...exported.environment.map((e) => `| \`${e.name}\` | ${cell(e.description)} |`),
		'',
		'## Exit codes',
		'',
		'| Code | Meaning |',
		'| --- | --- |',
		...exported.exitCodes.map((e) => `| \`${e.code}\` | ${cell(e.meaning)} |`),
		'',
		...other.flatMap((c) => subtree(c).map((s) => commandSection(s) + '\n')),
	].join('\n');

	files['project.md'] = [
		frontmatter('Project commands', 'caplo init, validate, diff, push, test, eval, publish and pull: commands that work on a project folder.', 1, 'Project'),
		banner(version, 'caplo <command> --help'),
		'These commands work on the project around the current directory, or the one `-C` names. See [Projects](/cli/projects/).',
		'',
		...project.flatMap((c) => subtree(c).map((s) => commandSection(s) + '\n')),
	].join('\n');

	groups.forEach((c, i) => {
		const name = c.path.split(' ')[1];
		files[`${name}.md`] = [
			frontmatter(c.path, sentence(c.short), i + 2, name),
			banner(version, `${c.path} --help`),
			...subtree(c).map((s, i) => commandSection(s, i === 0) + '\n'),
		].join('\n');
	});
	return files;
}
