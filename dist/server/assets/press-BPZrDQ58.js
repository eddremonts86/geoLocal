import { t as EditorialPage } from "./editorial-page-BJgIyQtx.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
//#region src/routes/_public/press.tsx?tsr-split=component
var COVERAGE = [
	{
		id: "politiken",
		outlet: "Politiken",
		dateKey: "press.c1.date",
		dateDefault: "March 2026",
		headlineKey: "press.c1.headline",
		headlineDefault: "A marketplace that reads like a magazine"
	},
	{
		id: "monocle",
		outlet: "Monocle",
		dateKey: "press.c2.date",
		dateDefault: "February 2026",
		headlineKey: "press.c2.headline",
		headlineDefault: "Copenhagen’s editorial answer to classifieds"
	},
	{
		id: "wallpaper",
		outlet: "Wallpaper*",
		dateKey: "press.c3.date",
		dateDefault: "January 2026",
		headlineKey: "press.c3.headline",
		headlineDefault: "Typography as interface: inside GeoLocal"
	}
];
function PressPage() {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsx(EditorialPage, {
		eyebrow: t("press.eyebrow", "05 · Press"),
		title: t("press.title", "Press & coverage."),
		lede: t("press.lede", "Selected recent coverage, and how to reach us for interviews, visuals, or commentary on the Copenhagen marketplace."),
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-12 gap-x-6 gap-y-12",
			children: [/* @__PURE__ */ jsxs("section", {
				className: "col-span-12 md:col-span-8",
				children: [/* @__PURE__ */ jsx("p", {
					className: "meta-label mb-6",
					style: { color: "var(--ink-3)" },
					children: t("press.recentLabel", "Recent coverage")
				}), /* @__PURE__ */ jsx("ul", {
					className: "divide-y divide-border",
					children: COVERAGE.map((c) => /* @__PURE__ */ jsxs("li", {
						className: "flex items-baseline justify-between gap-4 py-5",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ jsxs("p", {
								className: "meta-label mb-1.5",
								style: { color: "var(--amber-ink)" },
								children: [
									c.outlet,
									" ",
									/* @__PURE__ */ jsx("span", {
										style: { color: "var(--ink-4)" },
										children: "·"
									}),
									" ",
									/* @__PURE__ */ jsx("span", {
										style: { color: "var(--ink-3)" },
										children: t(c.dateKey, c.dateDefault)
									})
								]
							}), /* @__PURE__ */ jsx("p", {
								className: "font-display text-lg font-medium leading-[1.15] text-foreground md:text-xl",
								children: t(c.headlineKey, c.headlineDefault)
							})]
						}), /* @__PURE__ */ jsx(ArrowUpRight, {
							className: "h-4 w-4 shrink-0",
							style: { color: "var(--ink-3)" },
							strokeWidth: 1.5
						})]
					}, c.id))
				})]
			}), /* @__PURE__ */ jsxs("aside", {
				className: "col-span-12 md:col-span-4",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "meta-label mb-4",
						style: { color: "var(--ink-3)" },
						children: t("press.contactLabel", "Press contact")
					}),
					/* @__PURE__ */ jsx("p", {
						className: "font-display text-2xl font-medium leading-[1.1] text-foreground",
						children: "Clara Holm"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 text-sm",
						style: { color: "var(--ink-2)" },
						children: t("press.role", "Head of Communications")
					}),
					/* @__PURE__ */ jsxs("a", {
						href: "mailto:press@geolocal.cph",
						className: "mt-6 inline-flex items-center gap-1.5 border-b border-foreground pb-0.5 text-sm font-medium transition-colors hover:border-[var(--amber)] hover:text-[var(--amber-ink)]",
						children: ["press@geolocal.cph", /* @__PURE__ */ jsx(ArrowUpRight, {
							className: "h-3.5 w-3.5",
							strokeWidth: 1.5
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "meta-label mt-8",
						style: { color: "var(--ink-4)" },
						children: t("press.kitLabel", "Press kit on request")
					})
				]
			})]
		})
	});
}
//#endregion
export { PressPage as component };
