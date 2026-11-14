import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const gh = (args) => execFileSync('gh', args, { encoding: 'utf8' });

/** Downloads the latest public caplo release for this machine into dir, checks its checksum and returns the binary. */
export function downloadCli(dir) {
	const tag = JSON.parse(gh(['release', 'view', '--repo', 'getcaplo/homebrew-tap', '--json', 'tagName'])).tagName;
	const version = tag.replace(/^v/, '');
	const os = { darwin: 'darwin', linux: 'linux' }[process.platform];
	const arch = { x64: 'amd64', arm64: 'arm64' }[process.arch];
	if (!os || !arch) throw new Error(`no caplo release for ${process.platform}/${process.arch}`);
	const archive = `caplo_${version}_${os}_${arch}.tar.gz`;
	mkdirSync(dir, { recursive: true });
	gh(['release', 'download', tag, '--repo', 'getcaplo/homebrew-tap', '--dir', dir, '--clobber', '--pattern', archive, '--pattern', 'checksums.txt']);
	const expected = readFileSync(join(dir, 'checksums.txt'), 'utf8')
		.split('\n')
		.map((line) => line.trim().split(/\s+/))
		.find(([, name]) => name === archive)?.[0];
	const actual = createHash('sha256').update(readFileSync(join(dir, archive))).digest('hex');
	if (!expected || expected !== actual) throw new Error(`${archive}: checksum ${actual} does not match checksums.txt`);
	execFileSync('tar', ['-xzf', join(dir, archive), '-C', dir, 'caplo']);
	return join(dir, 'caplo');
}
