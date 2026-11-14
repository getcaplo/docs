import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { pageMarkdown } from '../lib/page-markdown';

export const getStaticPaths = (async () => {
	const pages = await getCollection('docs', ({ data }) => import.meta.env.MODE !== 'production' || !data.draft);
	return pages.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: CollectionEntry<'docs'> }> = async (context) =>
	new Response(await pageMarkdown(context.props.entry, context), {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
