import { o as UserButton } from "./dist-TPNQHynL.js";
import { t as cn } from "./utils-C17k1q7P.js";
import { n as ThemeToggle, t as LanguageSwitcher } from "./LanguageSwitcher-Cw_q7YP9.js";
import { t as getAdminBadgesFn } from "./admin-stats.fn-CfAoDK_g.js";
import { a as DropdownMenuSeparator, i as DropdownMenuLabel, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-DK24gMQb.js";
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowUpRight, Car, ChevronLeft, ChevronRight, Command, Flag, Globe, Home, Inbox, LayoutDashboard, List, Plus, Search, Sparkles, Users, Wrench } from "lucide-react";
//#region src/modules/admin/ui/AdminShell.tsx
var NAV_SECTIONS = [
	{
		label: "Overview",
		number: "01",
		items: [{
			label: "Dashboard",
			to: "/admin",
			icon: LayoutDashboard,
			exact: true
		}]
	},
	{
		label: "Catalog",
		number: "02",
		items: [{
			label: "Listings",
			to: "/admin/listings",
			icon: List,
			badgeKey: "drafts"
		}]
	},
	{
		label: "Pipeline",
		number: "03",
		items: [{
			label: "Review queue",
			to: "/admin/scraping",
			icon: Inbox,
			badgeKey: "pendingReview"
		}, {
			label: "Source candidates",
			to: "/admin/scraping/sources",
			icon: Globe,
			badgeKey: "pendingSources"
		}]
	},
	{
		label: "Moderation",
		number: "04",
		items: [{
			label: "Reports",
			to: "/admin/reports",
			icon: Flag
		}, {
			label: "Users",
			to: "/admin/users",
			icon: Users
		}]
	}
];
/**
* Build crumbs from the current pathname. Editorial, not cute.
* Produces e.g. ["ADMIN", "CATALOG", "LISTINGS"] for /admin/listings.
*/
function useBreadcrumbs() {
	const { location } = useRouterState();
	const parts = location.pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
	const SECTION_ALIAS = {
		admin: "Admin",
		listings: "Catalog · Listings",
		scraping: "Pipeline · Queue",
		sources: "Pipeline · Sources",
		new: "New"
	};
	const crumbs = [];
	let acc = "";
	for (const part of parts) {
		acc += `/${part}`;
		const looksLikeId = /^[0-9a-f-]{20,}$/.test(part) || part.length > 24;
		crumbs.push({
			label: looksLikeId ? "Detail" : SECTION_ALIAS[part] ?? part,
			to: acc
		});
	}
	return crumbs;
}
function AdminShell({ children }) {
	const [collapsed, setCollapsed] = useState(false);
	const [paletteOpen, setPaletteOpen] = useState(false);
	const { data: badges } = useQuery({
		queryKey: ["admin", "badges"],
		queryFn: () => getAdminBadgesFn(),
		refetchInterval: 6e4
	});
	useEffect(() => {
		const handler = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setPaletteOpen((v) => !v);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-screen bg-(--surface-1) text-foreground",
		children: [
			/* @__PURE__ */ jsx(AdminSidebar, {
				collapsed,
				onToggle: () => setCollapsed((c) => !c),
				badges
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ jsx(AdminTopbar, { onOpenPalette: () => setPaletteOpen(true) }), /* @__PURE__ */ jsx("main", {
					className: "flex-1 overflow-y-auto bg-background",
					children: /* @__PURE__ */ jsx("div", {
						className: "mx-auto max-w-[1600px] px-8 py-10",
						children
					})
				})]
			}),
			paletteOpen && /* @__PURE__ */ jsx(AdminCommandPalette, { onClose: () => setPaletteOpen(false) })
		]
	});
}
function AdminSidebar({ collapsed, onToggle, badges }) {
	const { location } = useRouterState();
	const path = location.pathname;
	const isActive = (item) => {
		if (item.exact) return path === item.to || path === `${item.to}/`;
		return path.startsWith(item.to);
	};
	return /* @__PURE__ */ jsxs("aside", {
		className: cn("flex h-screen flex-col border-r border-(--line-1) bg-(--surface-2) transition-[width] duration-200", collapsed ? "w-16" : "w-60"),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex h-16 items-center justify-between border-b border-(--line-1) px-[15px]",
				children: [!collapsed && /* @__PURE__ */ jsxs(Link, {
					to: "/admin",
					className: "flex items-baseline gap-1.5 leading-none",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-display text-lg font-medium tracking-[-0.01em] text-foreground",
						children: "GeoLocal"
					}), /* @__PURE__ */ jsx("span", {
						className: "meta-label",
						style: { color: "var(--ink-3)" },
						children: "admin"
					})]
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onToggle,
					"aria-label": "Toggle sidebar",
					className: "flex h-7 w-7 items-center justify-center rounded-none text-(--ink-3) hover:bg-(--surface-3) hover:text-foreground",
					children: collapsed ? /* @__PURE__ */ jsx(ChevronRight, {
						className: "h-4 w-4",
						strokeWidth: 1.5
					}) : /* @__PURE__ */ jsx(ChevronLeft, {
						className: "h-4 w-4",
						strokeWidth: 1.5
					})
				})]
			}),
			/* @__PURE__ */ jsx("nav", {
				className: "flex-1 overflow-y-auto py-4",
				children: NAV_SECTIONS.map((section) => /* @__PURE__ */ jsxs("div", {
					className: "mb-5 px-[15px] last:mb-0",
					children: [!collapsed && /* @__PURE__ */ jsxs("div", {
						className: "mb-1.5 flex items-center gap-2 px-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "meta-label",
							style: { color: "var(--ink-4)" },
							children: section.number
						}), /* @__PURE__ */ jsx("span", {
							className: "meta-label",
							style: { color: "var(--ink-3)" },
							children: section.label
						})]
					}), /* @__PURE__ */ jsx("ul", {
						className: "space-y-0.5",
						children: section.items.map((item) => {
							const active = isActive(item);
							const count = item.badgeKey ? badges?.[item.badgeKey] ?? 0 : 0;
							return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
								to: item.to,
								className: cn("group flex h-9 items-center gap-3 px-2 text-sm transition-colors", active ? "bg-(--surface-3) text-foreground" : "text-(--ink-2) hover:bg-(--surface-3)/60 hover:text-foreground"),
								title: collapsed ? item.label : void 0,
								children: [
									/* @__PURE__ */ jsx(item.icon, {
										className: "h-4 w-4 shrink-0",
										strokeWidth: 1.5
									}),
									!collapsed && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
										className: "flex-1 truncate",
										children: item.label
									}), count > 0 && /* @__PURE__ */ jsx("span", {
										className: cn("flex h-5 min-w-5 items-center justify-center px-1.5 text-[10px] font-medium tabular-nums", active ? "bg-(--amber) text-(--amber-ink)" : "bg-(--surface-3) text-(--ink-2)"),
										children: count > 99 ? "99+" : count
									})] }),
									collapsed && count > 0 && /* @__PURE__ */ jsx("span", {
										className: "absolute ml-6 h-1.5 w-1.5 rounded-full bg-(--amber-ink)",
										"aria-hidden": true
									})
								]
							}) }, item.to);
						})
					})]
				}, section.label))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "border-t border-(--line-1) px-[15px] py-3",
				children: [/* @__PURE__ */ jsxs(Link, {
					to: "/",
					className: cn("mb-2 flex h-8 items-center gap-2 px-2 text-xs transition-colors", "text-(--ink-3) hover:text-foreground"),
					children: [/* @__PURE__ */ jsx(ArrowLeft, {
						className: "h-3.5 w-3.5",
						strokeWidth: 1.5
					}), !collapsed && /* @__PURE__ */ jsx("span", {
						className: "meta-label",
						children: "Back to site"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 px-1",
					children: [/* @__PURE__ */ jsx(UserButton, { appearance: { elements: { avatarBox: "w-7 h-7" } } }), !collapsed && /* @__PURE__ */ jsx("div", {
						className: "flex-1 text-xs leading-tight",
						children: /* @__PURE__ */ jsx("div", {
							className: "meta-label",
							style: { color: "var(--ink-3)" },
							children: "Signed in"
						})
					})]
				})]
			})
		]
	});
}
function AdminTopbar({ onOpenPalette }) {
	const crumbs = useBreadcrumbs();
	return /* @__PURE__ */ jsxs("header", {
		className: "sticky top-0 z-40 flex h-14 items-center justify-between border-b border-(--line-1) bg-background/95 px-[15px] backdrop-blur-sm",
		children: [/* @__PURE__ */ jsx("nav", {
			"aria-label": "Breadcrumb",
			className: "min-w-0 flex-1",
			children: /* @__PURE__ */ jsx("ol", {
				className: "flex items-center gap-2 truncate",
				children: crumbs.map((c, i) => /* @__PURE__ */ jsxs("li", {
					className: "flex items-center gap-2",
					children: [i > 0 && /* @__PURE__ */ jsx("span", {
						className: "text-(--ink-4)",
						"aria-hidden": true,
						children: "·"
					}), c.to && i < crumbs.length - 1 ? /* @__PURE__ */ jsx(Link, {
						to: c.to,
						className: "meta-label text-(--ink-3) hover:text-foreground",
						children: c.label
					}) : /* @__PURE__ */ jsx("span", {
						className: "meta-label text-foreground",
						children: c.label
					})]
				}, `${c.to}-${i}`))
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-0.5",
			children: [
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: onOpenPalette,
					className: "flex h-9 items-center gap-2 border border-(--line-1) bg-(--surface-2) px-3 text-xs text-(--ink-2) transition-colors hover:bg-(--surface-3)",
					"aria-label": "Open command palette",
					children: [
						/* @__PURE__ */ jsx(Search, {
							className: "h-3.5 w-3.5",
							strokeWidth: 1.5
						}),
						/* @__PURE__ */ jsx("span", {
							className: "hidden sm:inline",
							children: "Search or run a command"
						}),
						/* @__PURE__ */ jsxs("kbd", {
							className: "ml-1 hidden items-center gap-0.5 border border-(--line-1) bg-background px-1.5 py-0.5 text-[10px] font-medium tabular-nums sm:inline-flex",
							children: [/* @__PURE__ */ jsx(Command, { className: "h-2.5 w-2.5" }), " K"]
						})
					]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "mx-1 h-4 w-px bg-(--line-1)",
					"aria-hidden": true
				}),
				/* @__PURE__ */ jsx(QuickAddMenu, {}),
				/* @__PURE__ */ jsx("span", {
					className: "mx-1 h-4 w-px bg-(--line-1)",
					"aria-hidden": true
				}),
				/* @__PURE__ */ jsx(LanguageSwitcher, {}),
				/* @__PURE__ */ jsx(ThemeToggle, {})
			]
		})]
	});
}
function QuickAddMenu() {
	return /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsxs("button", {
			type: "button",
			"aria-label": "Quick add",
			className: "flex h-9 items-center gap-1.5 bg-foreground px-3 text-xs font-medium text-background transition-opacity hover:opacity-90",
			children: [/* @__PURE__ */ jsx(Plus, {
				className: "h-3.5 w-3.5",
				strokeWidth: 2
			}), /* @__PURE__ */ jsx("span", {
				className: "hidden sm:inline",
				children: "New"
			})]
		})
	}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
		align: "end",
		className: "w-52 rounded-none",
		children: [
			/* @__PURE__ */ jsx(DropdownMenuLabel, {
				className: "meta-label",
				children: "Create listing"
			}),
			/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
			/* @__PURE__ */ jsx(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/admin/listings/new",
					search: { category: "property" },
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Home, {
						className: "h-4 w-4",
						strokeWidth: 1.5,
						style: { color: "var(--cat-property)" }
					}), "Property"]
				})
			}),
			/* @__PURE__ */ jsx(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/admin/listings/new",
					search: { category: "vehicle" },
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Car, {
						className: "h-4 w-4",
						strokeWidth: 1.5,
						style: { color: "var(--cat-vehicle)" }
					}), "Vehicle"]
				})
			}),
			/* @__PURE__ */ jsx(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/admin/listings/new",
					search: { category: "service" },
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Wrench, {
						className: "h-4 w-4",
						strokeWidth: 1.5,
						style: { color: "var(--cat-service)" }
					}), "Service"]
				})
			}),
			/* @__PURE__ */ jsx(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/admin/listings/new",
					search: { category: "experience" },
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Sparkles, {
						className: "h-4 w-4",
						strokeWidth: 1.5,
						style: { color: "var(--cat-experience)" }
					}), "Experience"]
				})
			})
		]
	})] });
}
function AdminCommandPalette({ onClose }) {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const { t: _t } = useTranslation();
	const go = (to, search) => {
		navigate({
			to,
			search
		});
		onClose();
	};
	const actions = [
		{
			id: "nav-dashboard",
			label: "Go to Dashboard",
			section: "Navigate",
			icon: LayoutDashboard,
			run: () => go("/admin")
		},
		{
			id: "nav-listings",
			label: "Go to Listings",
			section: "Navigate",
			icon: List,
			run: () => go("/admin/listings")
		},
		{
			id: "nav-review",
			label: "Go to Review queue",
			section: "Navigate",
			icon: Inbox,
			run: () => go("/admin/scraping")
		},
		{
			id: "nav-sources",
			label: "Go to Source candidates",
			section: "Navigate",
			icon: Globe,
			run: () => go("/admin/scraping/sources")
		},
		{
			id: "new-prop",
			label: "New property",
			section: "Create",
			icon: Home,
			run: () => go("/admin/listings/new", { category: "property" })
		},
		{
			id: "new-veh",
			label: "New vehicle",
			section: "Create",
			icon: Car,
			run: () => go("/admin/listings/new", { category: "vehicle" })
		},
		{
			id: "new-srv",
			label: "New service",
			section: "Create",
			icon: Wrench,
			run: () => go("/admin/listings/new", { category: "service" })
		},
		{
			id: "new-exp",
			label: "New experience",
			section: "Create",
			icon: Sparkles,
			run: () => go("/admin/listings/new", { category: "experience" })
		},
		{
			id: "goto-site",
			label: "Open public site",
			section: "Other",
			icon: ArrowUpRight,
			run: () => go("/")
		}
	];
	const q = query.trim().toLowerCase();
	const filtered = q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions;
	const grouped = filtered.reduce((acc, a) => {
		acc[a.section] ??= [];
		acc[a.section].push(a);
		return acc;
	}, {});
	return /* @__PURE__ */ jsx("div", {
		role: "dialog",
		"aria-modal": "true",
		className: "fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-xl border border-(--line-1) bg-background shadow-2xl",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3 border-b border-(--line-1) px-4",
				children: [
					/* @__PURE__ */ jsx(Search, {
						className: "h-4 w-4 text-(--ink-3)",
						strokeWidth: 1.5
					}),
					/* @__PURE__ */ jsx("input", {
						autoFocus: true,
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Search or run a command…",
						className: "h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-(--ink-4)",
						onKeyDown: (e) => {
							if (e.key === "Escape") onClose();
							if (e.key === "Enter" && filtered[0]) filtered[0].run();
						}
					}),
					/* @__PURE__ */ jsx("kbd", {
						className: "border border-(--line-1) bg-(--surface-2) px-1.5 py-0.5 text-[10px] text-(--ink-3)",
						children: "ESC"
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "max-h-[60vh] overflow-y-auto py-2",
				children: [Object.keys(grouped).length === 0 && /* @__PURE__ */ jsx("div", {
					className: "px-4 py-6 text-center text-sm text-(--ink-3)",
					children: "No results"
				}), Object.entries(grouped).map(([section, items]) => /* @__PURE__ */ jsxs("div", {
					className: "mb-2",
					children: [/* @__PURE__ */ jsx("div", {
						className: "meta-label px-4 py-1.5",
						style: { color: "var(--ink-4)" },
						children: section
					}), /* @__PURE__ */ jsx("ul", { children: items.map((a) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: a.run,
						className: "flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-(--ink-1) hover:bg-(--surface-2)",
						children: [a.icon && /* @__PURE__ */ jsx(a.icon, {
							className: "h-4 w-4 text-(--ink-3)",
							strokeWidth: 1.5
						}), /* @__PURE__ */ jsx("span", { children: a.label })]
					}) }, a.id)) })]
				}, section))]
			})]
		})
	});
}
//#endregion
//#region src/routes/_admin/route.tsx?tsr-split=component
function AdminLayoutWrapper() {
	return /* @__PURE__ */ jsx(AdminShell, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
//#endregion
export { AdminLayoutWrapper as component };
