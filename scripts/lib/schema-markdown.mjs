// Renders a JSON Schema as Markdown field tables: one table per object, nested objects in their own sections.

const escape = (text) => String(text).replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n+/g, ' ');

export function createRenderer(schema) {
	const resolve = (node) => {
		let current = node;
		const seen = new Set();
		while (current?.$ref) {
			if (seen.has(current.$ref)) throw new Error(`schema: $ref cycle at ${current.$ref}`);
			seen.add(current.$ref);
			const target = current.$ref.replace(/^#\//, '').split('/').reduce((value, key) => value?.[key], schema);
			if (!target) throw new Error(`schema: unresolved ${current.$ref}`);
			const { $ref, ...rest } = current;
			current = { ...target, ...rest };
		}
		return current ?? {};
	};

	// Merges allOf parts so an object's properties and required list are complete.
	const flatten = (node) => {
		const resolved = resolve(node);
		if (!resolved.allOf) return resolved;
		const parts = resolved.allOf.map(flatten);
		const { allOf, ...own } = resolved;
		return parts.reduce(
			(merged, part) => ({
				...part,
				...merged,
				properties: { ...merged.properties, ...part.properties },
				required: [...new Set([...(part.required ?? []), ...(merged.required ?? [])])],
			}),
			own,
		);
	};

	const variants = (node) => (node.oneOf ?? node.anyOf ?? []).map(flatten);

	const typeOf = (node) => {
		const n = flatten(node);
		if (n.const !== undefined) return `\`${JSON.stringify(n.const)}\``;
		if (n.enum) return n.enum.map((v) => `\`${JSON.stringify(v)}\``).join(', ');
		if (n.type === 'array') return `array of ${typeOf(n.items ?? {})}`;
		if (Array.isArray(n.type)) return n.type.join(' or ');
		if (n.type) return n.type;
		if (n.properties) return 'object';
		if (n.oneOf || n.anyOf) return [...new Set(variants(n).map(typeOf))].join(' or ');
		return 'any';
	};

	const constraints = (node) => {
		const n = flatten(node);
		const out = [];
		if (n.minimum !== undefined && n.maximum !== undefined) out.push(`From ${n.minimum} to ${n.maximum}.`);
		else if (n.minimum !== undefined) out.push(`At least ${n.minimum}.`);
		else if (n.maximum !== undefined) out.push(`At most ${n.maximum}.`);
		if (n.minLength !== undefined && n.minLength > 1) out.push(`At least ${n.minLength} characters.`);
		if (n.maxLength !== undefined) out.push(`At most ${n.maxLength} characters.`);
		if (n.minItems !== undefined && n.minItems > 0) out.push(`At least ${n.minItems} items.`);
		if (n.maxItems !== undefined) out.push(`At most ${n.maxItems} items.`);
		if (n.pattern) out.push(`Pattern \`${n.pattern}\`.`);
		if (n.default !== undefined) out.push(`Default \`${JSON.stringify(n.default)}\`.`);
		return out;
	};

	const objectOf = (node) => {
		const n = flatten(node);
		if (n.type === 'array') return objectOf(n.items ?? {});
		if (n.properties) return n;
		const objects = variants(n).filter((v) => v.properties);
		return objects.length === 1 ? objects[0] : undefined;
	};

	/** Renders the object at `path` and, after it, every nested object it contains. */
	const render = (node, path, depth = 2, seen = new Set()) => {
		const object = objectOf(node);
		if (!object) return '';
		const required = new Set(object.required ?? []);
		const rows = [];
		const nested = [];
		for (const [name, child] of Object.entries(object.properties)) {
			const childPath = path ? `${path}.${name}` : name;
			const resolved = flatten(child);
			const own = resolved.description?.trim();
			const description = [own && (/[.!?]$/.test(own) ? own : `${own}.`), ...constraints(child)].filter(Boolean).join(' ');
			const childObject = objectOf(child);
			const anchor = childObject && !seen.has(childObject) ? ` See [\`${childPath}\`](#${slug(childPath)}).` : '';
			rows.push(`| \`${name}\` | ${escape(typeOf(child))} | ${required.has(name) ? 'Yes' : ''} | ${escape(description)}${anchor} |`);
			if (childObject && !seen.has(childObject)) nested.push([child, childPath]);
		}
		const heading = path ? `${'#'.repeat(Math.min(depth, 4))} \`${path}\`\n\n` : '';
		const intro = path && object.description ? `${escape(object.description)}\n\n` : '';
		const extra = object.additionalProperties === false || object.unevaluatedProperties === false ? 'Other fields are refused.\n\n' : '';
		const table = ['| Field | Type | Required | Description |', '| --- | --- | --- | --- |', ...rows].join('\n');
		const inner = new Set([...seen, object]);
		return [heading + intro + table + '\n\n' + extra, ...nested.map(([child, childPath]) => render(child, childPath, depth + 1, inner))].join('\n');
	};

	return { render, flatten, resolve };
}

export function slug(text) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');
}
