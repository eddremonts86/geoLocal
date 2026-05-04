import { t as getGlobalStartContext } from "./getGlobalStartContext-DX3SW4NI.js";
import { s as getAuthObjectForAcceptedToken } from "./internal-DXCdJK08.js";
import { t as errorThrower } from "./utils-D2z7vV21.js";
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
export { auth as t };
