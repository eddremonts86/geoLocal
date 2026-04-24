//#region src/shared/lib/db/browser.ts
var getDb = () => {
	throw new Error("Database access is not available in the browser bundle");
};
//#endregion
export { getDb };
