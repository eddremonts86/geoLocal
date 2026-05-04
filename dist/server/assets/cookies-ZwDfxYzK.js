import { t as EditorialPage } from "./editorial-page-BJgIyQtx.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
//#region src/routes/_public/cookies.tsx?tsr-split=component
var COOKIES = [
	{
		id: "session",
		nameKey: "cookies.c1.name",
		nameDefault: "geolocal-session",
		purposeKey: "cookies.c1.purpose",
		purposeDefault: "Keeps you signed in across requests.",
		durationKey: "cookies.c1.duration",
		durationDefault: "30 days",
		kind: "essential"
	},
	{
		id: "theme",
		nameKey: "cookies.c2.name",
		nameDefault: "geolocal-theme",
		purposeKey: "cookies.c2.purpose",
		purposeDefault: "Remembers your light / dark mode choice.",
		durationKey: "cookies.c2.duration",
		durationDefault: "1 year",
		kind: "preferences"
	},
	{
		id: "locale",
		nameKey: "cookies.c3.name",
		nameDefault: "geolocal-locale",
		purposeKey: "cookies.c3.purpose",
		purposeDefault: "Stores your preferred language (en / es).",
		durationKey: "cookies.c3.duration",
		durationDefault: "1 year",
		kind: "preferences"
	},
	{
		id: "anon",
		nameKey: "cookies.c4.name",
		nameDefault: "_ga_geolocal",
		purposeKey: "cookies.c4.purpose",
		purposeDefault: "Anonymous product metrics (page views, performance).",
		durationKey: "cookies.c4.duration",
		durationDefault: "90 days",
		kind: "analytics"
	}
];
var KIND_LABEL = {
	essential: {
		key: "cookies.kind.essential",
		defaultLabel: "Essential"
	},
	preferences: {
		key: "cookies.kind.preferences",
		defaultLabel: "Preferences"
	},
	analytics: {
		key: "cookies.kind.analytics",
		defaultLabel: "Analytics"
	}
};
function CookiesPage() {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsxs(EditorialPage, {
		eyebrow: t("cookies.eyebrow", "09 · Cookies"),
		title: t("cookies.title", "Cookies policy."),
		lede: t("cookies.lede", "The short list of cookies we set, what they do, and how long they live."),
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "meta-label mb-12",
				style: { color: "var(--ink-4)" },
				children: t("cookies.updated", "Last updated · March 2026")
			}),
			/* @__PURE__ */ jsxs("dl", {
				className: "divide-y divide-border border-y border-border",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "hidden grid-cols-12 gap-x-6 py-3 md:grid",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "meta-label col-span-3",
							style: { color: "var(--ink-3)" },
							children: t("cookies.col.name", "Name")
						}),
						/* @__PURE__ */ jsx("span", {
							className: "meta-label col-span-5",
							style: { color: "var(--ink-3)" },
							children: t("cookies.col.purpose", "Purpose")
						}),
						/* @__PURE__ */ jsx("span", {
							className: "meta-label col-span-2",
							style: { color: "var(--ink-3)" },
							children: t("cookies.col.duration", "Duration")
						}),
						/* @__PURE__ */ jsx("span", {
							className: "meta-label col-span-2 text-right",
							style: { color: "var(--ink-3)" },
							children: t("cookies.col.kind", "Kind")
						})
					]
				}), COOKIES.map((c) => /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-12 gap-x-6 gap-y-2 py-5 text-sm md:py-6",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "col-span-12 md:col-span-3",
							children: /* @__PURE__ */ jsx("p", {
								className: "font-mono tabular-nums text-foreground",
								children: t(c.nameKey, c.nameDefault)
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: "col-span-12 leading-[1.55] md:col-span-5",
							style: { color: "var(--ink-2)" },
							children: t(c.purposeKey, c.purposeDefault)
						}),
						/* @__PURE__ */ jsx("div", {
							className: "col-span-6 tabular-nums md:col-span-2",
							style: { color: "var(--ink-3)" },
							children: t(c.durationKey, c.durationDefault)
						}),
						/* @__PURE__ */ jsx("div", {
							className: "col-span-6 text-right md:col-span-2",
							children: /* @__PURE__ */ jsx("span", {
								className: "meta-label",
								style: { color: c.kind === "essential" ? "var(--amber-ink)" : c.kind === "preferences" ? "var(--cat-vehicle)" : "var(--ink-3)" },
								children: t(KIND_LABEL[c.kind].key, KIND_LABEL[c.kind].defaultLabel)
							})
						})
					]
				}, c.id))]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-12 max-w-[60ch] text-base leading-[1.7]",
				style: { color: "var(--ink-2)" },
				children: t("cookies.footnote", "You can clear cookies at any time through your browser settings. Essential cookies are required for the site to function; disabling them will sign you out.")
			})
		]
	});
}
//#endregion
export { CookiesPage as component };
