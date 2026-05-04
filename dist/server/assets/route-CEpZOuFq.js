import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as auth } from "./auth-Cb6FgvC0.js";
import { redirect } from "@tanstack/react-router";
//#region src/routes/_account/route.tsx?tss-serverfn-split
var requireAuth_createServerFn_handler = createServerRpc({
	id: "e7ab81fb5a75a55cf6ceeb4c559f1bb7b985085fc524baa6c21c601db3ba9328",
	name: "requireAuth",
	filename: "src/routes/_account/route.tsx"
}, (opts) => requireAuth.__executeServer(opts));
var requireAuth = createServerFn().handler(requireAuth_createServerFn_handler, async () => {
	const { isAuthenticated } = await auth();
	if (!isAuthenticated) throw redirect({ to: "/sign-in" });
});
//#endregion
export { requireAuth_createServerFn_handler };
