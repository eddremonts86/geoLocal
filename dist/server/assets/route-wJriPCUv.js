import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as auth } from "./auth-Cb6FgvC0.js";
import { redirect } from "@tanstack/react-router";
//#region src/routes/_admin/route.tsx?tss-serverfn-split
var requireAdmin_createServerFn_handler = createServerRpc({
	id: "3fbb17efe26a17757945ced5a774577f93ccd1715634bd638fad4336a0ca15e9",
	name: "requireAdmin",
	filename: "src/routes/_admin/route.tsx"
}, (opts) => requireAdmin.__executeServer(opts));
var requireAdmin = createServerFn().handler(requireAdmin_createServerFn_handler, async () => {
	const { isAuthenticated } = await auth();
	if (!isAuthenticated) throw redirect({ to: "/sign-in" });
});
//#endregion
export { requireAdmin_createServerFn_handler };
