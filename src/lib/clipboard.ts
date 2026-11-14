/** Copies text that may still be loading; ClipboardItem keeps the click's user activation while it loads. */
export async function copyText(text: string | Promise<string>): Promise<boolean> {
	try {
		if (typeof text !== 'string' && 'ClipboardItem' in window) {
			const blob = text.then((value) => new Blob([value], { type: 'text/plain' }));
			await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
		} else {
			await navigator.clipboard.writeText(await text);
		}
		return true;
	} catch {
		return false;
	}
}

export function flash(label: HTMLElement, message: string, restore: string) {
	label.textContent = message;
	setTimeout(() => (label.textContent = restore), 2000);
}
