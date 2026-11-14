// Renders the public API of the published @caplo/tools package (its type declarations) as Markdown with TypeDoc.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Application } from 'typedoc';

// Always the public registry: a developer's npm config may point the @caplo scope at a local registry.
const registry = ['--registry=https://registry.npmjs.org/', '--@caplo:registry=https://registry.npmjs.org/'];
const npm = (args, cwd) => execFileSync('npm', [...args, ...registry], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

// Customer-facing entry points; the host harness exports are Caplo's own.
const modules = [
	{ entry: 'dist/index.d.ts', file: 'index.md', importPath: '@caplo/tools', title: '@caplo/tools', order: 0, label: 'Overview' },
	{ entry: 'dist/verify.d.ts', file: 'verify.md', importPath: '@caplo/tools/verify', title: '@caplo/tools/verify', order: 1, label: 'verify' },
];

/** Downloads the latest published @caplo/tools into work and returns { version, files } with Markdown by file name. */
export async function renderSdk(work) {
	const version = npm(['view', '@caplo/tools', 'version']);
	mkdirSync(work, { recursive: true });
	const tarball = npm(['pack', `@caplo/tools@${version}`, '--silent'], work).split('\n').pop();
	execFileSync('tar', ['-xzf', join(work, tarball), '-C', work]);
	const pkg = join(work, 'package');
	writeFileSync(
		join(work, 'tsconfig.json'),
		JSON.stringify({
			compilerOptions: { target: 'es2024', module: 'nodenext', moduleResolution: 'nodenext', allowImportingTsExtensions: true, noEmit: true, skipLibCheck: true, strict: true, types: [] },
			files: modules.map((m) => join(pkg, m.entry)),
		}),
	);
	const out = join(work, 'out');
	const app = await Application.bootstrapWithPlugins({
		plugin: ['typedoc-plugin-markdown', fileURLToPath(new URL('./typedoc-own-members.mjs', import.meta.url))],
		tsconfig: join(work, 'tsconfig.json'),
		entryPoints: modules.map((m) => join(pkg, m.entry)),
		out,
		readme: 'none',
		disableSources: true,
		excludePrivate: true,
		excludeInternal: true,
		excludeExternals: true,
		skipErrorChecking: true,
		validation: { notExported: false },
		outputFileStrategy: 'modules',
		flattenOutputFiles: true,
		hidePageHeader: true,
		hidePageTitle: true,
		hideBreadcrumbs: true,
		useCodeBlocks: true,
		parametersFormat: 'table',
		interfacePropertiesFormat: 'table',
		classPropertiesFormat: 'table',
		typeDeclarationFormat: 'table',
		groupOrder: ['Functions', 'Interfaces', 'Type Aliases', 'Variables', 'Classes', '*'],
	});
	const project = await app.convert();
	if (!project) throw new Error('TypeDoc could not read the @caplo/tools declarations');
	await app.generateOutputs(project);

	const link = (target) => (target === 'index.md' ? '/reference/sdk/' : `/reference/sdk/${target.replace(/\.md$/, '')}/`);
	const files = {};
	for (const m of modules) {
		const body = readFileSync(join(out, m.file), 'utf8')
			.replace(/\]\((index|verify)\.md(#[^)]*)?\)/g, (_, page, hash = '') => `](${link(`${page}.md`)}${hash})`)
			.trim();
		files[m.file] = [
			'---',
			`title: ${JSON.stringify(m.title)}`,
			`description: ${JSON.stringify(`API reference for ${m.importPath}, generated from the published package.`)}`,
			'editUrl: false',
			'sidebar:',
			`  order: ${m.order}`,
			`  label: ${JSON.stringify(m.label)}`,
			'---',
			'',
			`:::note[Generated reference]\nGenerated from \`@caplo/tools\` ${version} on npm. Install with \`npm install @caplo/tools\`; import from \`${m.importPath}\`. Guides: [Tools](/tools/).\n:::`,
			'',
			body,
			'',
		].join('\n');
	}
	return { version, files };
}
