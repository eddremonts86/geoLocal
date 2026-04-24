import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
//#region src/components/ui/footer.tsx
/**
* Editorial footer — Copenhagen magazine style.
* Three columns + masthead strip + bottom meta line with issue / city / year.
*/
function Footer() {
	const { t, i18n } = useTranslation();
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	return /* @__PURE__ */ jsx("footer", {
		className: "mt-24 border-t border-border bg-background md:mt-32",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-16 flex items-baseline justify-between gap-6 md:mb-20",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "meta-label",
							children: t("editorial.established", "Copenhagen · Est. 2026")
						}),
						/* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" }),
						/* @__PURE__ */ jsx("span", {
							className: "meta-label hidden md:inline",
							children: t("editorial.volume", "Vol. 01")
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-12 gap-x-6 gap-y-12",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "col-span-12 md:col-span-6",
							children: [/* @__PURE__ */ jsxs(Link, {
								to: "/",
								className: "inline-flex items-baseline gap-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-display text-4xl font-medium leading-none tracking-[-0.02em] text-foreground md:text-5xl",
									children: "GeoLocal"
								}), /* @__PURE__ */ jsx("span", {
									className: "meta-label",
									style: { color: "var(--ink-4)" },
									children: "CPH"
								})]
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-5 max-w-sm text-sm leading-relaxed",
								style: { color: "var(--ink-2)" },
								children: t("footer.tagline", "Properties, vehicles, and services — discovered on the map of Copenhagen.")
							})]
						}),
						/* @__PURE__ */ jsxs("nav", {
							className: "col-span-6 md:col-span-2",
							children: [/* @__PURE__ */ jsx("p", {
								className: "meta-label mb-5",
								style: { color: "var(--ink-3)" },
								children: t("footer.explore", "Explore")
							}), /* @__PURE__ */ jsxs("ul", {
								className: "space-y-3 text-sm",
								children: [
									/* @__PURE__ */ jsx(FooterLink, {
										to: "/explore",
										search: { category: "property" },
										children: t("categories.properties", "Properties")
									}),
									/* @__PURE__ */ jsx(FooterLink, {
										to: "/explore",
										search: { category: "vehicle" },
										children: t("categories.vehicles", "Vehicles")
									}),
									/* @__PURE__ */ jsx(FooterLink, {
										to: "/explore",
										search: { category: "service" },
										children: t("categories.services", "Services")
									}),
									/* @__PURE__ */ jsx(FooterLink, {
										to: "/explore",
										children: t("landing.exploreAll", "Explore all")
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("nav", {
							className: "col-span-6 md:col-span-2",
							children: [/* @__PURE__ */ jsx("p", {
								className: "meta-label mb-5",
								style: { color: "var(--ink-3)" },
								children: t("footer.company", "Company")
							}), /* @__PURE__ */ jsxs("ul", {
								className: "space-y-3 text-sm",
								children: [
									/* @__PURE__ */ jsx(FooterLink, {
										to: "/about",
										children: t("footer.about", "About")
									}),
									/* @__PURE__ */ jsx(FooterLink, {
										to: "/journal",
										children: t("footer.journal", "Journal")
									}),
									/* @__PURE__ */ jsx(FooterLink, {
										to: "/press",
										children: t("footer.press", "Press")
									}),
									/* @__PURE__ */ jsx(FooterLink, {
										to: "/contact",
										children: t("footer.contact", "Contact")
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("nav", {
							className: "col-span-12 md:col-span-2",
							children: [/* @__PURE__ */ jsx("p", {
								className: "meta-label mb-5",
								style: { color: "var(--ink-3)" },
								children: t("footer.legal", "Legal")
							}), /* @__PURE__ */ jsxs("ul", {
								className: "space-y-3 text-sm",
								children: [
									/* @__PURE__ */ jsx(FooterLink, {
										to: "/privacy",
										children: t("footer.privacy", "Privacy")
									}),
									/* @__PURE__ */ jsx(FooterLink, {
										to: "/terms",
										children: t("footer.terms", "Terms")
									}),
									/* @__PURE__ */ jsx(FooterLink, {
										to: "/cookies",
										children: t("footer.cookies", "Cookies")
									})
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 md:mt-20 md:flex-row md:items-baseline",
					children: [/* @__PURE__ */ jsxs("p", {
						className: "meta-label tabular-nums",
						style: { color: "var(--ink-3)" },
						children: [
							/* @__PURE__ */ jsx("span", { children: year }),
							/* @__PURE__ */ jsx("span", {
								className: "mx-2",
								style: { color: "var(--ink-4)" },
								children: "·"
							}),
							/* @__PURE__ */ jsx("span", { children: t("editorial.city", "Copenhagen") }),
							/* @__PURE__ */ jsx("span", {
								className: "mx-2",
								style: { color: "var(--ink-4)" },
								children: "·"
							}),
							/* @__PURE__ */ jsx("span", { children: t("footer.allRightsReserved", "All rights reserved") })
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-5 text-xs",
						style: { color: "var(--ink-3)" },
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "meta-label",
								children: i18n.language === "es" ? "ES" : "EN"
							}),
							/* @__PURE__ */ jsx("span", {
								style: { color: "var(--ink-4)" },
								children: "·"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "meta-label",
								children: "DKK"
							})
						]
					})]
				})
			]
		})
	});
}
function FooterLink({ to, search, children }) {
	return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
		to,
		search,
		className: "group inline-flex items-center gap-1.5 border-b border-transparent pb-0.5 text-foreground transition-colors hover:border-[var(--amber)] hover:text-[var(--amber-ink)]",
		children: [children, /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3 w-3 opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" })]
	}) });
}
//#endregion
export { Footer as t };
