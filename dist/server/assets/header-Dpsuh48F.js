import { n as Show, o as UserButton } from "./dist-TPNQHynL.js";
import { t as Button } from "./button-D7roF92S.js";
import { a as SheetTrigger, n as SheetContent, t as Sheet } from "./sheet-CpC1RgXs.js";
import { n as ThemeToggle, t as LanguageSwitcher } from "./LanguageSwitcher-Cw_q7YP9.js";
import { t as useFavorites } from "./useFavorites-Biw4cw7b.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { Car, Heart, Home, Menu, Sparkles, User, Wrench } from "lucide-react";
//#region src/components/ui/header.tsx
/**
* Editorial header — Copenhagen magazine style.
* Pegged to the viewport edges (px-[15px]) so it mirrors the footer masthead strip.
* Four verticals inline on desktop; hamburger sheet on mobile.
*/
var categories = [
	{
		value: "property",
		icon: Home,
		labelKey: "categories.properties",
		fallback: "Properties",
		accent: "var(--cat-property)"
	},
	{
		value: "vehicle",
		icon: Car,
		labelKey: "categories.vehicles",
		fallback: "Vehicles",
		accent: "var(--cat-vehicle)"
	},
	{
		value: "service",
		icon: Wrench,
		labelKey: "categories.services",
		fallback: "Services",
		accent: "var(--cat-service)"
	},
	{
		value: "experience",
		icon: Sparkles,
		labelKey: "categories.experiences",
		fallback: "Experiences",
		accent: "var(--cat-experience)"
	}
];
function Header() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [scrolled, setScrolled] = useState(false);
	const { count: favoriteCount } = useFavorites();
	useEffect(() => {
		const main = document.querySelector("main");
		if (!main) return;
		const onScroll = () => setScrolled(main.scrollTop > 4);
		onScroll();
		main.addEventListener("scroll", onScroll, { passive: true });
		return () => main.removeEventListener("scroll", onScroll);
	}, []);
	return /* @__PURE__ */ jsxs("header", {
		className: `sticky top-0 z-50 flex h-16 items-center justify-between bg-background/90 px-[15px] backdrop-blur-sm transition-colors duration-300 ${scrolled ? "border-b border-(--line-1)" : "border-b border-transparent"}`,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-10",
			children: [/* @__PURE__ */ jsxs(Link, {
				to: "/",
				className: "flex items-baseline gap-2 shrink-0",
				children: [/* @__PURE__ */ jsx("span", {
					className: "font-display text-xl font-medium leading-none tracking-[-0.02em] text-foreground",
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
				className: "hidden items-center gap-7 lg:flex",
				children: categories.map(({ value, labelKey, fallback, accent }) => /* @__PURE__ */ jsxs(Link, {
					to: "/explore",
					search: { category: value },
					className: "meta-label group relative transition-colors",
					style: { color: "var(--ink-2)" },
					children: [/* @__PURE__ */ jsx("span", {
						className: "transition-colors group-hover:text-foreground",
						style: { ["--cat-hover"]: accent },
						children: t(labelKey, fallback)
					}), /* @__PURE__ */ jsx("span", {
						"aria-hidden": true,
						className: "absolute -bottom-1.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full",
						style: { backgroundColor: accent }
					})]
				}, value))
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-0.5",
			children: [
				/* @__PURE__ */ jsxs(Button, {
					variant: "ghost",
					size: "icon",
					className: "relative h-9 w-9 rounded-none",
					"aria-label": t("nav.favorites", "Favorites"),
					suppressHydrationWarning: true,
					onClick: () => navigate({ to: "/favorites" }),
					children: [/* @__PURE__ */ jsx(Heart, {
						className: "h-4 w-4",
						strokeWidth: 1.5
					}), favoriteCount > 0 && /* @__PURE__ */ jsx("span", {
						className: "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-(--red) px-1 text-[10px] font-medium leading-none text-white tabular-nums",
						"aria-label": `${favoriteCount} saved`,
						children: favoriteCount > 99 ? "99+" : favoriteCount
					})]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "mx-1 hidden h-4 w-px bg-(--line-1) sm:inline-block",
					"aria-hidden": true
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "hidden items-center sm:flex",
					children: [/* @__PURE__ */ jsx(LanguageSwitcher, {}), /* @__PURE__ */ jsx(ThemeToggle, {})]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "mx-1 hidden h-4 w-px bg-(--line-1) sm:inline-block",
					"aria-hidden": true
				}),
				/* @__PURE__ */ jsxs(Show, {
					when: "signed-in",
					children: [/* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "sm",
						className: "meta-label hidden rounded-none px-3 sm:flex",
						style: { color: "var(--ink-2)" },
						onClick: () => navigate({ to: "/admin" }),
						children: "Admin"
					}), /* @__PURE__ */ jsx("div", {
						className: "hidden sm:flex",
						children: /* @__PURE__ */ jsx(UserButton, {})
					})]
				}),
				/* @__PURE__ */ jsx(Show, {
					when: "signed-out",
					children: /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						className: "hidden h-9 w-9 rounded-none sm:flex",
						"aria-label": t("nav.profile", "Profile"),
						onClick: () => navigate({ to: "/sign-in" }),
						children: /* @__PURE__ */ jsx(User, {
							className: "h-4 w-4",
							strokeWidth: 1.5
						})
					})
				}),
				/* @__PURE__ */ jsxs(Sheet, { children: [/* @__PURE__ */ jsx(SheetTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-9 w-9 rounded-none lg:hidden",
						"aria-label": t("nav.menu", "Menu"),
						children: /* @__PURE__ */ jsx(Menu, {
							className: "h-4 w-4",
							strokeWidth: 1.5
						})
					})
				}), /* @__PURE__ */ jsx(SheetContent, {
					side: "right",
					className: "w-80",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex h-full flex-col gap-10 pt-10",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "meta-label mb-5 px-3",
							style: { color: "var(--ink-3)" },
							children: t("nav.navigate", "Navigate")
						}), /* @__PURE__ */ jsx("div", {
							className: "flex flex-col",
							children: categories.map(({ value, icon: Icon, labelKey, fallback, accent }) => /* @__PURE__ */ jsxs("button", {
								type: "button",
								className: "group flex items-center justify-between gap-3 border-b border-(--line-1) px-3 py-4 text-left transition-colors hover:bg-(--surface-2)",
								onClick: () => navigate({
									to: "/explore",
									search: { category: value }
								}),
								children: [/* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ jsx(Icon, {
										className: "h-4 w-4",
										strokeWidth: 1.5,
										style: { color: accent }
									}), /* @__PURE__ */ jsx("span", {
										className: "font-display text-xl font-medium tracking-[-0.01em]",
										children: t(labelKey, fallback)
									})]
								}), /* @__PURE__ */ jsx("span", {
									className: "meta-label opacity-0 transition-opacity group-hover:opacity-100",
									style: { color: "var(--ink-3)" },
									children: "→"
								})]
							}, value))
						})] }), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-4 px-3 sm:hidden",
							children: [/* @__PURE__ */ jsx(LanguageSwitcher, {}), /* @__PURE__ */ jsx(ThemeToggle, {})]
						})]
					})
				})] })
			]
		})]
	});
}
//#endregion
export { Header as t };
