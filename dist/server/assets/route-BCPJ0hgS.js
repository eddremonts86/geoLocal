import { o as UserButton } from "./dist-DJ3cNMEy.js";
import { t as cn } from "./utils-C98NY0TH.js";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Globe, HelpCircle, LayoutDashboard, List, LogOut } from "lucide-react";
//#region src/components/ui/admin-sidebar.tsx
var navItems = [
	{
		key: "dashboard",
		to: "/admin",
		icon: LayoutDashboard
	},
	{
		key: "listings",
		to: "/admin/listings",
		icon: List
	},
	{
		key: "scraping",
		to: "/admin/scraping",
		icon: Globe
	}
];
function AdminSidebar() {
	const { t } = useTranslation();
	const currentPath = useRouterState().location.pathname;
	return /* @__PURE__ */ jsxs("aside", {
		className: "flex h-screen w-64 flex-col border-r border-border bg-surface-solid",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex h-16 items-center justify-between border-b border-border px-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary",
						children: /* @__PURE__ */ jsx("span", {
							className: "text-sm font-bold text-primary-foreground",
							children: "G"
						})
					}), /* @__PURE__ */ jsx("span", {
						className: "text-lg font-semibold text-foreground",
						children: "GeoLocal"
					})]
				}), /* @__PURE__ */ jsxs(Link, {
					to: "/",
					className: "flex items-center gap-1 text-xs text-muted transition hover:text-foreground",
					children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5" }), "Sitio"]
				})]
			}),
			/* @__PURE__ */ jsx("nav", {
				className: "flex-1 space-y-1 p-4",
				children: navItems.map((item) => {
					const isActive = item.to === "/admin" ? currentPath === "/admin" || currentPath === "/admin/" : currentPath.startsWith(item.to);
					return /* @__PURE__ */ jsxs(Link, {
						to: item.to,
						className: cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition", isActive ? "bg-accent text-primary-foreground" : "text-muted hover:bg-accent-soft hover:text-foreground"),
						children: [/* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5" }), t(`admin.${item.key}`)]
					}, item.key);
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-1 border-t border-border p-4",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-accent-soft hover:text-foreground",
					children: [/* @__PURE__ */ jsx(HelpCircle, { className: "h-5 w-5" }), t("admin.help")]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
					children: [/* @__PURE__ */ jsx(LogOut, { className: "h-5 w-5 text-muted" }), /* @__PURE__ */ jsx(UserButton, {})]
				})]
			})
		]
	});
}
//#endregion
//#region src/modules/admin/ui/AdminLayout.tsx
function AdminLayout({ children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-screen",
		children: [/* @__PURE__ */ jsx(AdminSidebar, {}), /* @__PURE__ */ jsx("main", {
			className: "flex-1 overflow-y-auto bg-background",
			children
		})]
	});
}
//#endregion
//#region src/routes/_admin/route.tsx?tsr-split=component
function AdminLayoutWrapper() {
	return /* @__PURE__ */ jsx(AdminLayout, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
//#endregion
export { AdminLayoutWrapper as component };
