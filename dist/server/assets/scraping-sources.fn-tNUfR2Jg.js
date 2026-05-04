import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as loadDb } from "./load-gagVjFt5.js";
import { _ as scrapingSources, g as scrapedSourceCandidates, h as scrapedRaw } from "./schema-Bm7YGE-a.js";
import { z } from "zod";
import { asc, count, desc, eq, sql } from "drizzle-orm";
//#region src/modules/admin/api/scraping-sources.fn.ts?tss-serverfn-split
/**
* Server fns for the source-discovery admin page.
* Candidates are populated by scripts/scraping/discovery.ts.
*/
var statusSchema = z.enum([
	"pending",
	"approved",
	"rejected",
	"dead"
]);
var listSourceCandidatesFn_createServerFn_handler = createServerRpc({
	id: "700b5f2d38895b2fed3ef9912674e8ce57189ca5b5d273a6795ec3d404d98235",
	name: "listSourceCandidatesFn",
	filename: "src/modules/admin/api/scraping-sources.fn.ts"
}, (opts) => listSourceCandidatesFn.__executeServer(opts));
var listSourceCandidatesFn = createServerFn({ method: "GET" }).inputValidator(z.object({ status: statusSchema.optional() })).handler(listSourceCandidatesFn_createServerFn_handler, async ({ data }) => {
	const query = (await loadDb()).select().from(scrapedSourceCandidates).orderBy(desc(scrapedSourceCandidates.discoveredAt));
	return { items: data.status ? await query.where(eq(scrapedSourceCandidates.status, data.status)) : await query };
});
var updateSourceCandidateStatusFn_createServerFn_handler = createServerRpc({
	id: "477c55fcb7b9e28b013ddd664b7aa81722509f9ded35beb607ec5bf092bb525c",
	name: "updateSourceCandidateStatusFn",
	filename: "src/modules/admin/api/scraping-sources.fn.ts"
}, (opts) => updateSourceCandidateStatusFn.__executeServer(opts));
var updateSourceCandidateStatusFn = createServerFn({ method: "POST" }).inputValidator(z.object({
	id: z.string().uuid(),
	status: statusSchema
})).handler(updateSourceCandidateStatusFn_createServerFn_handler, async ({ data }) => {
	const db = await loadDb();
	const [cand] = await db.update(scrapedSourceCandidates).set({ status: data.status }).where(eq(scrapedSourceCandidates.id, data.id)).returning();
	if (cand && data.status === "approved") await db.insert(scrapingSources).values({
		key: cand.domain,
		label: cand.domain,
		domain: cand.domain,
		status: "active",
		kind: "none"
	}).onConflictDoNothing({ target: scrapingSources.key });
	return { ok: true };
});
var listBuiltInSourcesFn_createServerFn_handler = createServerRpc({
	id: "903d421bd77322f07210e4130186d3741cdb66011e1a51d1151ea6f3316c83f3",
	name: "listBuiltInSourcesFn",
	filename: "src/modules/admin/api/scraping-sources.fn.ts"
}, (opts) => listBuiltInSourcesFn.__executeServer(opts));
var listBuiltInSourcesFn = createServerFn({ method: "GET" }).handler(listBuiltInSourcesFn_createServerFn_handler, async () => {
	const db = await loadDb();
	const sources = await db.select().from(scrapingSources).where(sql`${scrapingSources.status} != 'deprecated'`).orderBy(asc(scrapingSources.kind), asc(scrapingSources.key));
	const stats = await db.select({
		source: scrapedRaw.source,
		status: scrapedRaw.status,
		count: count(),
		lastSeenAt: sql`max(${scrapedRaw.createdAt})`
	}).from(scrapedRaw).groupBy(scrapedRaw.source, scrapedRaw.status);
	const map = /* @__PURE__ */ new Map();
	for (const s of sources) map.set(s.key, {
		source: s.key,
		label: s.label,
		domain: s.domain,
		kind: s.kind === "none" ? "approved-candidate" : "built-in",
		sourceStatus: s.status,
		total: 0,
		pending: 0,
		reviewed: 0,
		published: 0,
		rejected: 0,
		lastSeenAt: null
	});
	for (const r of stats) {
		const t = map.get(r.source);
		if (!t) continue;
		t.total += r.count;
		if (r.status === "pending") t.pending = r.count;
		else if (r.status === "reviewed") t.reviewed = r.count;
		else if (r.status === "published") t.published = r.count;
		else if (r.status === "rejected") t.rejected = r.count;
		if (r.lastSeenAt && (!t.lastSeenAt || r.lastSeenAt > t.lastSeenAt)) t.lastSeenAt = r.lastSeenAt;
	}
	return { items: Array.from(map.values()).sort((a, b) => {
		if (a.kind !== b.kind) return a.kind === "built-in" ? -1 : 1;
		if (a.total !== b.total) return b.total - a.total;
		return a.source.localeCompare(b.source);
	}) };
});
//#endregion
export { listBuiltInSourcesFn_createServerFn_handler, listSourceCandidatesFn_createServerFn_handler, updateSourceCandidateStatusFn_createServerFn_handler };
