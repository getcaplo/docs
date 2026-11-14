import production from '../data/versions.json';

const versions: Record<string, string> = production.versions;

function parse(version: string): number[] {
	const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version.trim());
	if (!match) throw new Error(`not a semantic version: ${version}`);
	return match.slice(1).map(Number);
}

function compare(a: string, b: string): number {
	const [x, y] = [parse(a), parse(b)];
	for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
	return 0;
}

/** Reports whether production runs every repository at or above the `>=X.Y.Z` version a page requires. */
export function satisfied(requires: Record<string, string>): boolean {
	return Object.entries(requires).every(([repository, range]) => {
		const minimum = /^>=\s*(.+)$/.exec(range)?.[1];
		if (!minimum) throw new Error(`requires.${repository}: only ">=X.Y.Z" is supported, got "${range}"`);
		if (!(repository in versions)) throw new Error(`requires.${repository}: not in src/data/versions.json`);
		return compare(versions[repository], minimum) >= 0;
	});
}
