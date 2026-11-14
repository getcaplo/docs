export const site = 'https://docs.caplo.si';

/** The Markdown copy of a page: /agents/publishing/ is /agents/publishing.md and / is /index.md. */
export function markdownPath(pathname: string): string {
	const path = pathname.replace(/\/+$/, '');
	return `${path || '/index'}.md`;
}

export function claudeUrl(prompt: string): string {
	return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
}

export function chatgptUrl(prompt: string): string {
	return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}
