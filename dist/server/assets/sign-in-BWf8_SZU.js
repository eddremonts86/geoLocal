import { a as SignIn$1, i as OrganizationProfile$1, r as OrganizationList$1, s as UserProfile$1 } from "./dist-TPNQHynL.js";
import { n as useRoutingProps } from "./internal-BvuRWgVR.js";
import { useRef } from "react";
import { useLocation, useParams } from "@tanstack/react-router";
import { jsx } from "react/jsx-runtime";
//#region node_modules/.pnpm/@clerk+tanstack-react-start@1.1.3_@tanstack+react-router@1.168.23_react-dom@19.2.5_reac_8420fd103656890cead693296d295640/node_modules/@clerk/tanstack-react-start/dist/client/uiComponents.js
var usePathnameWithoutSplatRouteParams = () => {
	const { _splat } = useParams({ strict: false });
	const { pathname } = useLocation();
	const splatRouteParam = _splat || "";
	return useRef(`/${pathname.replace(splatRouteParam, "").replace(/\/$/, "").replace(/^\//, "").trim()}`).current;
};
Object.assign((props) => {
	return /* @__PURE__ */ jsx(UserProfile$1, { ...useRoutingProps("UserProfile", props, { path: usePathnameWithoutSplatRouteParams() }) });
}, { ...UserProfile$1 });
Object.assign((props) => {
	return /* @__PURE__ */ jsx(OrganizationProfile$1, { ...useRoutingProps("OrganizationProfile", props, { path: usePathnameWithoutSplatRouteParams() }) });
}, { ...OrganizationProfile$1 });
Object.assign((props) => {
	return /* @__PURE__ */ jsx(OrganizationList$1, { ...useRoutingProps("OrganizationList", props, { path: usePathnameWithoutSplatRouteParams() }) });
}, { ...OrganizationList$1 });
var SignIn = (props) => {
	return /* @__PURE__ */ jsx(SignIn$1, { ...useRoutingProps("SignIn", props, { path: usePathnameWithoutSplatRouteParams() }) });
};
//#endregion
//#region src/routes/sign-in.tsx?tsr-split=component
function SignInPage() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ jsx(SignIn, {})
	});
}
//#endregion
export { SignInPage as component };
