import { t as Header } from "./header-Dpsuh48F.js";
import { useEffect, useRef } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/_public/route.tsx?tsr-split=component
/**
* Pathnames that own their scroll state (split-view / map pages).
* We do NOT force scroll-to-top on these — they manage their own panes.
*/
var SCROLL_EXEMPT = ["/explore"];
function PublicLayoutWrapper() {
	const mainRef = useRef(null);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	useEffect(() => {
		if (SCROLL_EXEMPT.some((p) => pathname.startsWith(p))) return;
		const id = requestAnimationFrame(() => {
			mainRef.current?.scrollTo({
				top: 0,
				left: 0
			});
		});
		return () => cancelAnimationFrame(id);
	}, [pathname]);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-screen flex-col",
		children: [/* @__PURE__ */ jsx(Header, {}), /* @__PURE__ */ jsx("main", {
			ref: mainRef,
			className: "flex-1 overflow-y-auto",
			children: /* @__PURE__ */ jsx(Outlet, {})
		})]
	});
}
//#endregion
export { PublicLayoutWrapper as component };
