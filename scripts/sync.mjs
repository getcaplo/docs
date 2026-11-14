#!/usr/bin/env node
// Regenerates the reference from what production runs:
//   - image versions pinned in getcaplo/argocd-deployments (environments/production and apps-production)
//   - the latest CLI release in getcaplo/homebrew-tap, checked against its checksums, then `caplo docs export`
// Writes src/data/versions.json, src/data/cli.json, public/schemas/ and src/content/docs/reference/.
//
// Options:
//   --cli <path>       use this caplo binary instead of downloading the latest release
//   --argocd <path>    read production versions from a local argocd-deployments checkout instead of cloning it

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { renderCli } from './lib/cli-markdown.mjs';
import { downloadCli } from './lib/cli-release.mjs';
import { createRenderer } from './lib/schema-markdown.mjs';
import { renderSdk } from './lib/sdk-markdown.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { values: args } = parseArgs({ options: { cli: { type: 'string' }, argocd: { type: 'string' } } });
const work = mkdtempSync(join(tmpdir(), 'caplo-docs-sync-'));
const run = (cmd, argv, options = {}) => execFileSync(cmd, argv, { encoding: 'utf8', maxBuffer: 64 << 20, ...options });
const semver = /^\d+\.\d+\.\d+$/;

function walk(dir) {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? walk(path) : [path];
	});
}

function compare(a, b) {
	const [x, y] = [a, b].map((v) => v.split('.').map(Number));
	return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
}

/** The highest version of each getcaplo image that production pins. */
function productionVersions() {
	let checkout = args.argocd && resolve(args.argocd);
	if (!checkout) {
		checkout = join(work, 'argocd-deployments');
		run('gh', ['repo', 'clone', 'getcaplo/argocd-deployments', checkout, '--', '--depth=1', '--quiet']);
	}
	const versions = {};
	const image = /ghcr\.io\/getcaplo\/([a-z0-9-]+):v(\d+\.\d+\.\d+)\b/g;
	for (const dir of ['environments/production', 'apps-production']) {
		for (const file of walk(join(checkout, dir))) {
			if (!/\.ya?ml$/.test(file)) continue;
			for (const [, name, version] of readFileSync(file, 'utf8').matchAll(image)) {
				if (!versions[name] || compare(version, versions[name]) > 0) versions[name] = version;
			}
		}
	}
	if (Object.keys(versions).length === 0) throw new Error(`no getcaplo images found in ${checkout}`);
	return versions;
}

function exportCli(binary) {
	try {
		return JSON.parse(run(binary, ['docs', 'export'], { env: { PATH: process.env.PATH, HOME: work } }));
	} catch (error) {
		throw new Error(`${binary} docs export failed; the CLI needs the hidden docs export command (caplo-cli 0.4.0 or later).\n${error.message}`);
	}
}

function write(path, content) {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, content);
}

const json = (value) => JSON.stringify(value, null, 2) + '\n';

function schemaPage(file, title, description, schema, order, intro, sections) {
	const { render } = createRenderer(schema);
	const body = sections.map(([heading, node, text]) => `## ${heading}\n\n${text ? text + '\n\n' : ''}${render(node, '', 2)}`).join('\n');
	write(
		join(root, 'src/content/docs/reference', file),
		[
			'---',
			`title: ${JSON.stringify(title)}`,
			`description: ${JSON.stringify(description)}`,
			'editUrl: false',
			'sidebar:',
			`  order: ${order}`,
			'---',
			'',
			intro,
			'',
			body,
		].join('\n'),
	);
}

try {
	const versions = productionVersions();
	const binary = args.cli ? resolve(args.cli) : downloadCli(join(work, 'cli'));
	const exported = exportCli(binary);
	if (!semver.test(exported.version)) throw new Error(`the CLI reports version ${exported.version}; use a release build`);
	versions['caplo-cli'] = exported.version;
	const sdk = await renderSdk(join(work, 'sdk'));
	versions['tool-sdk'] = sdk.version;

	const sorted = Object.fromEntries(Object.entries(versions).sort(([a], [b]) => a.localeCompare(b)));
	write(join(root, 'src/data/versions.json'), json({ versions: sorted }));

	const { schemas, ...cli } = exported;
	write(join(root, 'src/data/cli.json'), json(cli));
	rmSync(join(root, 'public/schemas'), { recursive: true, force: true });
	for (const [name, schema] of Object.entries(schemas)) write(join(root, 'public/schemas', name), json(schema));

	rmSync(join(root, 'src/content/docs/reference'), { recursive: true, force: true });
	for (const [name, content] of Object.entries(renderCli(exported))) write(join(root, 'src/content/docs/reference/cli', name), content);
	for (const [name, content] of Object.entries(sdk.files)) write(join(root, 'src/content/docs/reference/sdk', name), content);

	const agentName = Object.keys(schemas).find((n) => n.startsWith('agent-'));
	const agent = schemas[agentName];
	const editor = (name, glob) =>
		`For validation and completion in your editor, add this first line to the file (YAML language server, used by VS Code and others):\n\n\`\`\`yaml\n# yaml-language-server: $schema=https://docs.caplo.si/schemas/${name}\n\`\`\`\n\nThe schema is also published at [/schemas/${name}](/schemas/${name})${glob ? ` and applies to ${glob}` : ''}.`;
	schemaPage(
		'agent-yaml.md',
		'Agent YAML',
		'Every field of an agent file (apiVersion v2.0.0), generated from the schema the CLI and console validate against.',
		agent,
		10,
		[
			`:::note[Generated reference]\nGenerated from the schema in \`caplo\` v${exported.version}. Guide: [Agent YAML](/agents/agent-yaml/).\n:::`,
			'',
			editor(agentName),
		].join('\n'),
		[
			['Agent file', agent.$defs.agentDocument, 'A file with `kind: Agent` edits or creates one agent.'],
			['Bundle file', agent.$defs.bundleDocument, 'A bundle holds several agents in one file, as the console exports them.'],
		],
	);
	schemaPage(
		'caplo-yaml.md',
		'caplo.yaml (tool package)',
		'Every field of a tool package caplo.yaml, generated from the schema the CLI and builder validate against.',
		schemas['caplo.schema.json'],
		11,
		[
			`:::note[Generated reference]\nGenerated from the schema in \`caplo\` v${exported.version}. Guides: [Tools](/tools/).\n:::`,
			'',
			editor('caplo.schema.json'),
		].join('\n'),
		[['Fields', schemas['caplo.schema.json']]],
	);
	schemaPage(
		'fixtures.md',
		'Tool fixtures',
		'Every field of a tool test fixture, generated from the schema caplo tool test validates against.',
		schemas['fixture.schema.json'],
		12,
		`:::note[Generated reference]\nGenerated from the schema in \`caplo\` v${exported.version}. Guide: [Test tools](/tools/testing/).\n:::\n\n${editor('fixture.schema.json')}`,
		[['Fields', schemas['fixture.schema.json']]],
	);

	console.log(`synced: caplo ${exported.version}, @caplo/tools ${sdk.version}, ${Object.keys(versions).length - 2} production images`);
} finally {
	rmSync(work, { recursive: true, force: true });
}
