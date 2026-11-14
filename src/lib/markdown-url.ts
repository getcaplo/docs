export const site = 'https://docs.caplo.si';

/** The Markdown copy of a page: /agents/publishing/ is /agents/publishing.md and / is /index.md. */
export function markdownPath(pathname: string): string {
	const path = pathname.replace(/\/+$/, '');
	return `${path || '/index'}.md`;
}

/** Every docs page has a Markdown copy, except Starlight's generated 404 page. */
export function hasMarkdown(route: { entry: { id: string } }): boolean {
	return route.entry.id !== '404';
}

export function claudeUrl(prompt: string): string {
	return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
}

export function chatgptUrl(prompt: string): string {
	return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}
