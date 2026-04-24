import { t as getGlobalStartContext } from "./getGlobalStartContext-DX3SW4NI.js";
import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-cwd1hhjG.js";
import { t as errorThrower } from "./utils-BGQUucrf.js";
import { s as getAuthObjectForAcceptedToken } from "./internal-DoLi3XIA.js";
import { redirect } from "@tanstack/react-router";
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/utils/errors.js
var createErrorMessage = (msg) => {
	return `\u{1F512} Clerk: ${msg.trim()}

For more info, check out the docs: https://clerk.com/docs,
or come say hi in our discord server: https://clerk.com/discord

`;
};
createErrorMessage(`
  You're calling 'getAuth()' from a server function, without providing the request object.
  Example:

  export const someServerFunction = createServerFn({ method: 'GET' }).handler(async () => {
    const request = getWebRequest()
    const auth = getAuth(request);
    ...
  });
  `);
var clerkMiddlewareNotConfigured = createErrorMessage(`
It looks like you're trying to use Clerk without configuring the middleware.

To fix this, make sure you have the \`clerkMiddleware()\` configured in your \`createStart()\` function in your \`src/start.ts\` file.`);
//#endregion
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/server/auth.js
var auth = (async (opts) => {
	const authObjectFn = getGlobalStartContext().auth;
	if (!authObjectFn) return errorThrower.throw(clerkMiddlewareNotConfigured);
	return getAuthObjectForAcceptedToken({
		authObject: await Promise.resolve(authObjectFn({ treatPendingAsSignedOut: opts?.treatPendingAsSignedOut })),
		acceptsToken: opts?.acceptsToken
	});
});
//#endregion
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
