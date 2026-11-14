import mdxServer from '@astrojs/mdx/server.js';
import type { APIContext } from 'astro';
import { experimental_AstroContainer } from 'astro/container';
import { render, type CollectionEntry } from 'astro:content';
import type { Element, Root, RootContent } from 'hast';
import { matches, select, selectAll } from 'hast-util-select';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { remove } from 'unist-util-remove';

const container = await experimental_AstroContainer.create({
	renderers: [{ name: 'astro:jsx', ssr: mdxServer }],
});

/** Expressive Code blocks: keep the language and drop the terminal frame label. */
function codeBlocks() {
	return (tree: Root) => {
		for (const block of selectAll('.expressive-code', tree)) {
			const chrome = new Set<unknown>(selectAll('figcaption span.sr-only, .copy', block));
			remove(block, (node) => chrome.has(node));
			const pre = select('pre', block);
			const code = select('code', block);
			if (pre?.properties.dataLanguage && code) {
				code.properties.className = [`language-${pre.properties.dataLanguage}`];
			}
		}
	};
}

/** Tabs become a list of labelled panels, so every variant survives. */
function tabs() {
	return (tree: Root) => {
		for (const instance of selectAll('starlight-tabs', tree)) {
			const labels = selectAll('[role="tab"]', instance);
			const panels = selectAll('[role="tabpanel"]', instance);
			instance.tagName = 'div';
			instance.properties = {};
			instance.children = panels.flatMap((panel, i): Element[] => [
				{
					type: 'element',
					tagName: 'p',
					properties: {},
					children: [{ type: 'element', tagName: 'strong', properties: {}, children: [{ type: 'text', value: textOf(labels[i]) }] }],
				},
				panel,
			]);
		}
	};
}

/** Interactive controls and anchors have no meaning in Markdown. */
function chrome() {
	return (tree: Root) => {
		remove(tree, (node) => node.type === 'comment' || matches('button, script, style, .sl-anchor-link, [data-copy-prompt]', node as RootContent));
	};
}

function textOf(node: Element | undefined): string {
	if (!node) return '';
	return node.children.map((child) => (child.type === 'text' ? child.value : child.type === 'element' ? textOf(child) : '')).join('').trim();
}

const pipeline = unified()
	.use(rehypeParse, { fragment: true })
	.use(chrome)
	.use(codeBlocks)
	.use(tabs)
	.use(rehypeRemark)
	.use(remarkGfm)
	.use(remarkStringify);

/** Renders a docs entry and converts the HTML to Markdown, so components appear as their content. */
export async function pageMarkdown(entry: CollectionEntry<'docs'>, context: APIContext): Promise<string> {
	const { Content } = await render(entry);
	const html = await container.renderToString(Content, context);
	const body = String(await pipeline.process(html)).trim();
	const { title, description } = entry.data;
	return `# ${title}\n\n> ${description}\n\n${body}\n`;
}
