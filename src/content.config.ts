import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { satisfied } from './lib/versions';

const extend = z.object({
	description: z.string().min(1),
	// A page that needs a newer release stays a draft, which production builds leave out, until production runs it.
	requires: z.record(z.string(), z.string()).optional(),
});

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: (context) =>
			docsSchema({ extend })(context).transform((data) =>
				data.requires && !satisfied(data.requires) ? { ...data, draft: true } : data,
			),
	}),
	prompts: defineCollection({
		loader: glob({ pattern: '*.md', base: './src/content/prompts' }),
		schema: z.object({ title: z.string(), description: z.string() }),
	}),
};
