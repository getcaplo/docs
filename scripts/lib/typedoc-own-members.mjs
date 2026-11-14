// TypeDoc plugin: document only members a type declares itself, so SDK error classes do not repeat Error's members.
import { Converter, ReflectionKind } from 'typedoc';

/** @param {import('typedoc').Application} app */
export function load(app) {
	app.converter.on(Converter.EVENT_RESOLVE_BEGIN, (context) => {
		const members = context.project.getReflectionsByKind(ReflectionKind.Property | ReflectionKind.Method | ReflectionKind.Accessor);
		for (const member of members) {
			if (member.flags.isExternal || ('inheritedFrom' in member && member.inheritedFrom)) context.project.removeReflection(member);
		}
	});
}
