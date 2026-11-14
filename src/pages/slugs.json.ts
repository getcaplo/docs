import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Every published page path, for clients that link into the docs (the console checks its links against it).
export const GET: APIRoute = async () => {
	const pages = await getCollection('docs', ({ data }) => import.meta.env.MODE !== 'production' || !data.draft);
	const paths = pages.map((entry) => (entry.id === 'index' ? '/' : `/${entry.id}/`)).sort();
	return new Response(JSON.stringify(paths, null, '\t') + '\n', { headers: { 'Content-Type': 'application/json' } });
};
