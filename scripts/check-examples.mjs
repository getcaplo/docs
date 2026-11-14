#!/usr/bin/env node
// Fails when the hand-written docs drift from the released CLI and schemas:
//   - every `caplo ...` command in code blocks, inline code and prompts must exist, with flags it accepts
//   - every complete agent file or tool package caplo.yaml in a yaml block must validate against its schema
//   - every https://docs.caplo.si/... link in pages and prompts must point at a page or published file
//   - every project under examples/ must pass `caplo validate` with the CLI in $CAPLO_BIN, when it is set

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { parse as parseYaml } from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = JSON.parse(readFileSync(join(root, 'src/data/cli.json'), 'utf8'));
const commands = new Map(cli.commands.map((c) => [c.path, c]));
const problems = [];
const report = (file, line, message) => problems.push(`${relative(root, file)}:${line}: ${message}`);

const walk = (dir) =>
	readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? walk(path) : [path];
	});

const docsDir = join(root, 'src/content/docs');
const files = [
	...walk(docsDir).filter((f) => /\.mdx?$/.test(f) && !f.startsWith(join(docsDir, 'reference'))),
	...walk(join(root, 'src/content/prompts')).filter((f) => f.endsWith('.md')),
];

// Splits a shell command line into words, keeping quoted strings whole.
function words(line) {
	const out = [];
	for (const m of line.matchAll(/"((?:[^"\\]|\\.)*)"|'([^']*)'|(\S+)/g)) out.push(m[1] ?? m[2] ?? m[3]);
	return out;
}

function checkCommand(file, line, text) {
	const argv = words(text);
	let path = 'caplo';
	let i = 1;
	while (i < argv.length && commands.has(`${path} ${argv[i]}`)) path = `${path} ${argv[i++]}`;
	const cmd = commands.get(path);
	const next = argv[i];
	if (!cmd.runnable && next && /^[a-z][a-z-]*$/.test(next)) {
		report(file, line, `unknown command "${path} ${next}" in: ${text}`);
		return;
	}
	const flags = [...(cmd.flags ?? []), ...(cmd.inheritedFlags ?? [])];
	const long = new Set(['help', 'version', ...flags.map((f) => f.name)]);
	const short = new Set(['h', 'v', ...flags.map((f) => f.shorthand).filter(Boolean)]);
	for (const word of argv.slice(i)) {
		if (word === '--') break;
		const longFlag = /^--([a-z0-9-]+)(=.*)?$/.exec(word);
		const shortFlag = /^-([a-zA-Z])$/.exec(word);
		if (longFlag && !long.has(longFlag[1])) report(file, line, `"${path}" has no flag --${longFlag[1]}`);
		if (shortFlag && !short.has(shortFlag[1])) report(file, line, `"${path}" has no flag -${shortFlag[1]}`);
	}
}

// Finds caplo invocations in a shell line: at its start or after a shell operator.
function shellCommands(line) {
	return line
		.replace(/^\s*\$\s+/, '')
		.split(/&&|\|\||;|\||\$\(|`|\(/)
		.map((part) => part.trim().replace(/^(?:sudo|exec|time|env\s+\S+=\S+)\s+/, ''))
		.filter((part) => /^caplo(\s|$)/.test(part));
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
const schemaFile = (name) => JSON.parse(readFileSync(join(root, 'public/schemas', name), 'utf8'));
const agentSchemaName = readdirSync(join(root, 'public/schemas')).find((n) => n.startsWith('agent-'));
const validators = {
	agent: ajv.compile(schemaFile(agentSchemaName)),
	tool: ajv.compile(schemaFile('caplo.schema.json')),
};
const toolKind = schemaFile('caplo.schema.json').properties?.kind?.const;

function checkYaml(file, line, source) {
	let doc;
	try {
		doc = parseYaml(source);
	} catch (error) {
		report(file, line, `yaml does not parse: ${error.message.split('\n')[0]}`);
		return;
	}
	if (!doc || typeof doc !== 'object') return;
	const isAgent = /^v2(\.0(\.0)?)?$/.test(String(doc.apiVersion ?? '')) && ['Agent', 'AgentBundle'].includes(doc.kind) && 'name' in doc;
	const isTool = toolKind && doc.kind === toolKind && 'type' in doc && 'entry' in doc;
	const validate = isAgent ? validators.agent : isTool ? validators.tool : null;
	if (validate && !validate(doc)) {
		for (const e of validate.errors.slice(0, 5)) report(file, line, `${isAgent ? 'agent' : 'caplo.yaml'} ${e.instancePath || '/'} ${e.message}`);
	}
}

const pageExists = (path) => {
	const clean = path.replace(/#.*$/, '').replace(/\.md$/, '').replace(/^\/|\/$/g, '');
	if (clean.startsWith('schemas/')) return existsSync(join(root, 'public', clean));
	if (['llms.txt', 'llms-full.txt', 'llms-small.txt'].includes(clean) || clean.startsWith('_llms-txt/')) return true;
	if (clean.startsWith('reference/')) return ['.md', '/index.md'].some((ext) => existsSync(join(docsDir, clean + ext)));
	return ['', 'index'].includes(clean) || ['.md', '.mdx', '/index.md', '/index.mdx'].some((ext) => existsSync(join(docsDir, clean + ext)));
};

for (const file of files) {
	const lines = readFileSync(file, 'utf8').split('\n');
	let fence = null;
	let block = [];
	lines.forEach((text, index) => {
		const line = index + 1;
		const open = /^\s*(```+|~~~+)\s*([a-z]*)/.exec(text);
		if (fence) {
			if (open && open[1] === fence.marker) {
				if (fence.lang === 'yaml' || fence.lang === 'yml') checkYaml(file, fence.line, block.join('\n'));
				fence = null;
				block = [];
				return;
			}
			block.push(text);
			if (['sh', 'bash', 'shell', 'console', 'zsh', ''].includes(fence.lang)) {
				for (const cmd of shellCommands(text.replace(/\s+#.*$/, ''))) checkCommand(file, line, cmd);
			}
		} else if (open) {
			fence = { marker: open[1], lang: open[2], line };
		} else {
			for (const m of text.matchAll(/`(caplo(?:\s[^`]*)?)`/g)) checkCommand(file, line, m[1]);
			if (file.includes('/prompts/')) for (const cmd of shellCommands(text)) checkCommand(file, line, cmd);
		}
		for (const m of text.matchAll(/https:\/\/docs\.caplo\.si(\/[^\s)"'`>\]]*)/g)) {
			if (!pageExists(m[1].replace(/[.,;:]+$/, ''))) report(file, line, `no page or file for https://docs.caplo.si${m[1]}`);
		}
	});
}

const examples = join(root, 'examples');
if (process.env.CAPLO_BIN && existsSync(examples)) {
	for (const name of readdirSync(examples)) {
		const dir = join(examples, name);
		if (!existsSync(join(dir, 'caplo.yaml'))) continue;
		try {
			execFileSync(process.env.CAPLO_BIN, ['validate', '-C', dir], { encoding: 'utf8', stdio: 'pipe' });
		} catch (error) {
			report(join(dir, 'caplo.yaml'), 1, `caplo validate failed:\n${error.stdout}${error.stderr}`);
		}
	}
}

if (problems.length) {
	console.error(`${problems.length} docs problem(s) against caplo ${cli.version}:\n${problems.join('\n')}`);
	process.exit(1);
}
console.log(`docs match caplo ${cli.version}: ${files.length} files checked`);
