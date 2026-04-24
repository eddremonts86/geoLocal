import { n as Show, o as UserButton } from "./dist-DJ3cNMEy.js";
import { t as Button } from "./button-DX0eJ04i.js";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CIGqjYoW.js";
import { a as SheetTrigger, n as SheetContent, o as useTheme, t as Sheet } from "./sheet-Hy7N214o.js";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Car, Globe, Heart, Home, Menu, Moon, Sun, User, Wrench } from "lucide-react";
//#region src/modules/shared/ui/ThemeToggle.tsx
function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	return /* @__PURE__ */ jsx(Button, {
		variant: "ghost",
		size: "icon",
		onClick: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
		"aria-label": resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
		className: "relative h-9 w-9",
		children: /* @__PURE__ */ jsx(m.div, {
			initial: {
				scale: .5,
				opacity: 0,
				rotate: -90
			},
			animate: {
				scale: 1,
				opacity: 1,
				rotate: 0
			},
			transition: {
				type: "spring",
				stiffness: 300,
				damping: 20
			},
			children: resolvedTheme === "dark" ? /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" })
		}, resolvedTheme)
	});
}
//#endregion
//#region src/modules/shared/ui/LanguageSwitcher.tsx
function LanguageSwitcher() {
	const { i18n } = useTranslation();
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	const currentLang = mounted ? i18n.language : "en";
	const nextLang = currentLang === "es" ? "en" : "es";
	return /* @__PURE__ */ jsxs(Button, {
		variant: "ghost",
		size: "sm",
		onClick: () => i18n.changeLanguage(nextLang),
		"aria-label": `Switch to ${nextLang === "es" ? "Spanish" : "English"}`,
		className: "gap-1.5 text-muted",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", {
			className: "text-xs font-medium uppercase",
			suppressHydrationWarning: true,
			children: currentLang
		})]
	});
}
//#endregion
//#region src/components/ui/header.tsx
var categories = [
	{
		value: "property",
		icon: Home,
		labelKey: "categories.properties"
	},
	{
		value: "vehicle",
		icon: Car,
		labelKey: "categories.vehicles"
	},
	{
		value: "service",
		icon: Wrench,
		labelKey: "categories.services"
	}
];
function Header() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	return /* @__PURE__ */ jsxs("header", {
		className: "sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur-sm md:px-8",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-8",
			children: [/* @__PURE__ */ jsxs(Link, {
				to: "/",
				className: "flex items-baseline gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "font-display text-lg font-medium tracking-[-0.02em] text-foreground",
					children: "GeoLocal"
				}), /* @__PURE__ */ jsx("span", {
					className: "meta-label hidden sm:inline",
					style: {
						color: "var(--ink-4)",
						fontSize: "0.625rem"
					},
					children: "CPH"
				})]
			}), /* @__PURE__ */ jsx("nav", {
				className: "hidden items-center md:flex",
				children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "meta-label border-b border-transparent pb-0.5 transition-colors hover:border-[var(--amber)] hover:text-foreground",
						suppressHydrationWarning: true,
						style: { color: "var(--ink-2)" },
						children: /* @__PURE__ */ jsx("span", {
							suppressHydrationWarning: true,
							children: t("nav.explore")
						})
					})
				}), /* @__PURE__ */ jsx(DropdownMenuContent, {
					align: "start",
					className: "w-52 rounded-none",
					children: categories.map(({ value, icon: Icon, labelKey }) => /* @__PURE__ */ jsxs(DropdownMenuItem, {
						onClick: () => navigate({
							to: "/explore",
							search: { category: value }
						}),
						className: "gap-2 rounded-none",
						children: [/* @__PURE__ */ jsx(Icon, {
							className: "h-3.5 w-3.5",
							strokeWidth: 1.5
						}), t(labelKey)]
					}, value))
				})] })
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "icon",
					className: "h-9 w-9 rounded-none",
					"aria-label": t("nav.favorites"),
					suppressHydrationWarning: true,
					children: /* @__PURE__ */ jsx(Heart, {
						className: "h-4 w-4",
						strokeWidth: 1.5
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "hidden sm:contents",
					children: [/* @__PURE__ */ jsx(LanguageSwitcher, {}), /* @__PURE__ */ jsx(ThemeToggle, {})]
				}),
				/* @__PURE__ */ jsx(Show, {
					when: "signed-in",
					children: /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "sm",
						className: "hidden rounded-none px-3 text-xs font-medium sm:flex",
						onClick: () => navigate({ to: "/admin" }),
						children: "Admin"
					})
				}),
				/* @__PURE__ */ jsx(Show, {
					when: "signed-out",
					children: /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						className: "hidden h-9 w-9 rounded-none sm:flex",
						"aria-label": t("nav.profile"),
						onClick: () => navigate({ to: "/sign-in" }),
						children: /* @__PURE__ */ jsx(User, {
							className: "h-4 w-4",
							strokeWidth: 1.5
						})
					})
				}),
				/* @__PURE__ */ jsx(Show, {
					when: "signed-in",
					children: /* @__PURE__ */ jsx("div", {
						className: "hidden sm:flex",
						children: /* @__PURE__ */ jsx(UserButton, {})
					})
				}),
				/* @__PURE__ */ jsxs(Sheet, { children: [/* @__PURE__ */ jsx(SheetTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-9 w-9 rounded-none md:hidden",
						children: /* @__PURE__ */ jsx(Menu, {
							className: "h-4 w-4",
							strokeWidth: 1.5
						})
					})
				}), /* @__PURE__ */ jsx(SheetContent, {
					side: "right",
					className: "w-72",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-1 pt-10",
						children: [/* @__PURE__ */ jsx("p", {
							className: "meta-label mb-2 px-3",
							children: t("nav.explore")
						}), categories.map(({ value, icon: Icon, labelKey }) => /* @__PURE__ */ jsxs(Button, {
							variant: "ghost",
							className: "justify-start gap-2 rounded-none",
							onClick: () => navigate({
								to: "/explore",
								search: { category: value }
							}),
							children: [/* @__PURE__ */ jsx(Icon, {
								className: "h-4 w-4",
								strokeWidth: 1.5
							}), t(labelKey)]
						}, value))]
					})
				})] })
			]
		})]
	});
}
//#endregion
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
