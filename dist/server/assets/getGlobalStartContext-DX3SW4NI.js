import { n as getStartContext } from "../server.js";
//#region node_modules/.pnpm/@tanstack+start-client-core@1.167.17/node_modules/@tanstack/start-client-core/dist/esm/getGlobalStartContext.js
var getGlobalStartContext = () => {
	const context = getStartContext().contextAfterGlobalMiddlewares;
	if (!context) throw new Error(`Global context not set yet, you are calling getGlobalStartContext() before the global middlewares are applied.`);
	return context;
};
//#endregion
export { getGlobalStartContext as t };
