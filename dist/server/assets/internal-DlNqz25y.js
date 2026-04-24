import { c as incompatibleRoutingWithPathProvidedError, l as noPathProvidedError, t as ClerkProvider, u as errorThrower } from "./dist-DJ3cNMEy.js";
//#region node_modules/.pnpm/@clerk+react@6.4.2_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@clerk/react/dist/internal.mjs
function useRoutingProps(componentName, props, routingOptions) {
	const path = props.path || (routingOptions == null ? void 0 : routingOptions.path);
	if ((props.routing || (routingOptions == null ? void 0 : routingOptions.routing) || "path") === "path") {
		if (!path) return errorThrower.throw(noPathProvidedError(componentName));
		return {
			...routingOptions,
			...props,
			routing: "path"
		};
	}
	if (props.path) return errorThrower.throw(incompatibleRoutingWithPathProvidedError(componentName));
	return {
		...routingOptions,
		...props,
		path: void 0
	};
}
var InternalClerkProvider = ClerkProvider;
//#endregion
export { useRoutingProps as n, InternalClerkProvider as t };
