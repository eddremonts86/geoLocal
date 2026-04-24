//#region src/shared/lib/db/load.ts
async function loadDb() {
	const { getDb } = await import("./browser-D3Q38ID_.js");
	return getDb();
}
//#endregion
export { loadDb as t };
