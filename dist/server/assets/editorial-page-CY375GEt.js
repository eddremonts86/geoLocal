import { r as EDITORIAL_EASE } from "./display-wPMPnOaq.js";
import { t as Footer } from "./footer-Do_tZ2fr.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
//#region src/components/composite/editorial-page.tsx
/**
* Shared editorial layout for static pages (about, press, legal, etc.).
* Matches the Copenhagen design system used by the landing hero.
*/
function EditorialPage({ eyebrow, title, lede, children }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-background",
		children: [/* @__PURE__ */ jsxs("article", {
			className: "mx-auto max-w-[1400px] px-6 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28 lg:pt-32",
			children: [
				/* @__PURE__ */ jsxs(m.div, {
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .5,
						ease: EDITORIAL_EASE
					},
					className: "mb-10 flex items-baseline gap-6",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "meta-label",
							children: t("editorial.established", "Copenhagen · Est. 2026")
						}),
						/* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" }),
						/* @__PURE__ */ jsx("span", {
							className: "meta-label hidden md:inline",
							children: eyebrow
						})
					]
				}),
				/* @__PURE__ */ jsx(m.h1, {
					initial: {
						opacity: 0,
						y: 24
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .7,
						ease: EDITORIAL_EASE,
						delay: .08
					},
					className: "font-display max-w-[18ch] text-[clamp(2.5rem,1.8rem+4vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.025em] text-foreground",
					children: title
				}),
				lede && /* @__PURE__ */ jsx(m.p, {
					initial: {
						opacity: 0,
						y: 16
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .6,
						ease: EDITORIAL_EASE,
						delay: .18
					},
					className: "mt-8 max-w-[60ch] text-lg leading-[1.55] md:text-xl",
					style: { color: "var(--ink-2)" },
					children: lede
				}),
				/* @__PURE__ */ jsx("div", { className: "mt-14 h-px bg-border md:mt-20" }),
				/* @__PURE__ */ jsx(m.div, {
					initial: {
						opacity: 0,
						y: 16
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .5,
						ease: EDITORIAL_EASE,
						delay: .24
					},
					className: "mt-12 md:mt-16",
					children
				})
			]
		}), /* @__PURE__ */ jsx(Footer, {})]
	});
}
/**
* Section heading used inside the editorial body.
* Renders a numbered meta-label + underline + Fraunces subtitle.
*/
function EditorialSection({ number, label, title, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "grid grid-cols-12 gap-x-6 gap-y-4 py-10 md:py-14",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "col-span-12 md:col-span-4",
			children: [/* @__PURE__ */ jsxs("p", {
				className: "meta-label",
				style: { color: "var(--ink-3)" },
				children: [
					number,
					" · ",
					label
				]
			}), /* @__PURE__ */ jsx("h2", {
				className: "font-display mt-4 text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-medium leading-[1.05] tracking-[-0.015em] text-foreground",
				children: title
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "col-span-12 space-y-5 text-base leading-[1.7] md:col-span-7 md:col-start-6",
			style: { color: "var(--ink-2)" },
			children
		})]
	});
}
//#endregion
export { EditorialSection as n, EditorialPage as t };
