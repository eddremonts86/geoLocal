//#region src/shared/lib/db/load.ts
async function loadDb() {
	const { getDb } = await import("./browser-xL7gykVk.js");
	return getDb();
}
//#endregion
export { loadDb as t };
