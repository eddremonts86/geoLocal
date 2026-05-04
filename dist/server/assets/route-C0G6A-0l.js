import { t as Header } from "./header-Dpsuh48F.js";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/_account/route.tsx?tsr-split=component
var NAV = [
	{
		to: "/account",
		label: "Overview",
		exact: true
	},
	{
		to: "/account/listings",
		label: "My listings"
	},
	{
		to: "/account/messages",
		label: "Messages"
	},
	{
		to: "/account/payments",
		label: "Payments"
	},
	{
		to: "/account/profile",
		label: "Profile"
	}
];
function AccountLayout() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-screen flex-col",
		children: [/* @__PURE__ */ jsx(Header, {}), /* @__PURE__ */ jsx("div", {
			className: "flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950",
			children: /* @__PURE__ */ jsx("div", {
				className: "mx-auto max-w-6xl px-6 py-10",
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-12 gap-8",
					children: [/* @__PURE__ */ jsx("aside", {
						className: "col-span-12 md:col-span-3",
						children: /* @__PURE__ */ jsxs("nav", {
							className: "sticky top-0 space-y-1",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500",
								children: "Account"
							}), NAV.map((item) => {
								const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
								return /* @__PURE__ */ jsx(Link, {
									to: item.to,
									className: `block rounded-md px-3 py-2 text-sm transition ${active ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800"}`,
									children: item.label
								}, item.to);
							})]
						})
					}), /* @__PURE__ */ jsx("main", {
						className: "col-span-12 md:col-span-9",
						children: /* @__PURE__ */ jsx(Outlet, {})
					})]
				})
			})
		})]
	});
}
//#endregion
export { AccountLayout as component };
