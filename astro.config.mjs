// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightImageZoom from 'starlight-image-zoom';

/** @param {string} label @param {string} directory */
const section = (label, directory, collapsed = false) => ({ label, collapsed, items: [{ autogenerate: { directory } }] });

export default defineConfig({
	site: 'https://docs.caplo.si',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: 'Caplo Docs',
			description: 'Build, test and publish AI agents for web chat, voice, phone and messaging with Caplo.',
			logo: {
				light: './src/assets/caplo-logo-light.svg',
				dark: './src/assets/caplo-logo-dark.svg',
				replacesTitle: true,
			},
			favicon: '/favicon.svg',
			head: [
				{ tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '32x32' } },
				{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
			],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/getcaplo/docs' },
			],
			editLink: { baseUrl: 'https://github.com/getcaplo/docs/edit/main/' },
			lastUpdated: true,
			customCss: ['./src/styles/caplo.css'],
			components: {
				Head: './src/components/Head.astro',
				PageTitle: './src/components/PageTitle.astro',
				SiteTitle: './src/components/SiteTitle.astro',
			},
			sidebar: [
				section('Get started', 'get-started'),
				section('Concepts', 'concepts', true),
				section('Build agents', 'agents'),
				section('Tools', 'tools'),
				section('Channels', 'channels'),
				section('Customer identity', 'identity', true),
				section('Models and providers', 'providers'),
				section('Plans and billing', 'billing'),
				section('Usage and spend', 'usage'),
				section('Operate', 'operate', true),
				section('Administration', 'admin', true),
				section('CLI', 'cli'),
				section('Reference', 'reference', true),
				section('Resources', 'resources', true),
				{ label: 'Open the console', link: 'https://app.caplo.si', attrs: { target: '_blank', rel: 'noopener' } },
			],
			plugins: [
				starlightLinksValidator({ errorOnLocalLinks: true }),
				starlightImageZoom(),
				starlightLlmsTxt({
					projectName: 'Caplo',
					description:
						'Caplo is a platform for building, testing and publishing AI agents that talk to customers over a website widget, voice, phone and messaging channels. Agents are configured in the Caplo console or as YAML files with the `caplo` CLI, call tool packages (TypeScript functions or MCP servers) and remote MCP servers, search knowledge bases, and are published as immutable releases that channels serve.',
					details: [
						'- Every page is also available as Markdown: append `.md` to its URL without the trailing slash, for example https://docs.caplo.si/agents/publishing.md.',
						'- JSON Schemas for agent files, tool package `caplo.yaml` and fixtures are at https://docs.caplo.si/schemas/.',
						'- The CLI reference is generated from the released `caplo` binary; prefer it over guesses about flags.',
					].join('\n'),
					optionalLinks: [
						{ label: 'Caplo console', url: 'https://app.caplo.si', description: 'Sign in to build and operate agents.' },
						{ label: 'Caplo website', url: 'https://caplo.si' },
					],
					customSets: [
						{ label: 'Build agents', paths: ['agents/**', 'concepts/**'], description: 'agent configuration, knowledge, sub-agents, evals and publishing' },
						{ label: 'Tools', paths: ['tools/**', 'reference/caplo-yaml', 'reference/fixtures'], description: 'writing, testing and publishing tool packages and remote MCP servers' },
						{ label: 'CLI', paths: ['cli/**', 'reference/cli/**'], description: 'installing and using the caplo CLI, with the full command reference' },
						{ label: 'Channels', paths: ['channels/**'], description: 'the website widget, WhatsApp, Messenger, Instagram, phone channels and Chatwoot handoff' },
						{ label: 'Customer identity', paths: ['identity/**', 'tools/customer-aware-tools'], description: 'verifying customers and letting tools act on their accounts' },
						{ label: 'Workspace administration', paths: ['admin/**', 'operate/**', 'billing/**', 'usage/**', 'providers/**'], description: 'members, SSO, API keys, secrets, provider keys, plans and billing, usage, the inbox and data settings' },
						{ label: 'SDK', paths: ['reference/sdk/**', 'tools/**'], description: 'the @caplo/tools API and tool package guides' },
					],
					promote: ['get-started/**', 'concepts/**'],
					demote: ['reference/**', 'resources/**'],
				}),
			],
		}),
	],
});
