#!/usr/bin/env node
// Downloads the latest caplo release into the given directory and prints the binary's path.
import { resolve } from 'node:path';
import { downloadCli } from './lib/cli-release.mjs';

console.log(downloadCli(resolve(process.argv[2] ?? '.caplo-cli')));
