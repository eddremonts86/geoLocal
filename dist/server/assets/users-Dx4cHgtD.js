import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as loadDb } from "./load-gagVjFt5.js";
import { x as userProfiles } from "./schema-Bm7YGE-a.js";
import { t as requireAdmin } from "./guards-S7H8UmzC.js";
import { z } from "zod";
import { desc, ilike, or } from "drizzle-orm";
//#region src/routes/_admin/admin/users.tsx?tss-serverfn-split
/**
* Admin → users.
*
* Lists known user_profiles rows (anyone who has signed in at least once) and
* lets admins ban / unban accounts. Banning is delegated to `banUserFn`, which
* also archives all of the user's listings.
*/
var listUsersFn_createServerFn_handler = createServerRpc({
	id: "4174cf29acf4ec80d5532e79f8f4720c9b0c4c3bed82765f23de7a9912e8c345",
	name: "listUsersFn",
	filename: "src/routes/_admin/admin/users.tsx"
}, (opts) => listUsersFn.__executeServer(opts));
var listUsersFn = createServerFn({ method: "GET" }).inputValidator(z.object({ q: z.string().max(100).optional() }).optional()).handler(listUsersFn_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const db = await loadDb();
	const query = data?.q?.trim();
	return await db.select({
		userId: userProfiles.userId,
		handle: userProfiles.handle,
		displayName: userProfiles.displayName,
		email: userProfiles.email,
		role: userProfiles.role,
		bannedAt: userProfiles.bannedAt,
		bannedReason: userProfiles.bannedReason,
		createdAt: userProfiles.createdAt
	}).from(userProfiles).where(query ? or(ilike(userProfiles.handle, `%${query}%`), ilike(userProfiles.displayName, `%${query}%`), ilike(userProfiles.email, `%${query}%`), ilike(userProfiles.userId, `%${query}%`)) : void 0).orderBy(desc(userProfiles.createdAt)).limit(200);
});
//#endregion
export { listUsersFn_createServerFn_handler };
