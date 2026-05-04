import { t as EditorialPage } from "./editorial-page-BJgIyQtx.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
//#region src/routes/_public/journal.tsx?tsr-split=component
var ENTRIES = [
	{
		id: "vesterbro",
		issue: "Vol. 01",
		dateKey: "journal.e1.date",
		dateDefault: "April, 2026",
		titleKey: "journal.e1.title",
		titleDefault: "The quiet streets of Vesterbro",
		dekKey: "journal.e1.dek",
		dekDefault: "A walking portrait of the neighbourhood that became Copenhagen’s most editorial postcode — corner cafés, restored apartments, and the return of small retail.",
		readKey: "journal.e1.read",
		readDefault: "8 min read"
	},
	{
		id: "ev",
		issue: "Vol. 01",
		dateKey: "journal.e2.date",
		dateDefault: "April, 2026",
		titleKey: "journal.e2.title",
		titleDefault: "On electric cars, finally",
		dekKey: "journal.e2.dek",
		dekDefault: "Why our vehicle listings show range and year above all else, and what that reveals about how Copenhageners actually move.",
		readKey: "journal.e2.read",
		readDefault: "5 min read"
	},
	{
		id: "service",
		issue: "Vol. 01",
		dateKey: "journal.e3.date",
		dateDefault: "March, 2026",
		titleKey: "journal.e3.title",
		titleDefault: "The service economy, mapped",
		dekKey: "journal.e3.dek",
		dekDefault: "From tutors in Nørrebro to movers in Valby — how geography changes pricing and how we surface that honestly.",
		readKey: "journal.e3.read",
		readDefault: "6 min read"
	}
];
function JournalPage() {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsx(EditorialPage, {
		eyebrow: t("journal.eyebrow", "04 · Journal"),
		title: t("journal.title", "Field notes from the city."),
		lede: t("journal.lede", "Short essays on Copenhagen, real estate, mobility, and the crafts we learn from listing the city’s everyday objects."),
		children: /* @__PURE__ */ jsx("ul", {
			className: "divide-y divide-border",
			children: ENTRIES.map((entry, i) => /* @__PURE__ */ jsxs("li", {
				className: "grid grid-cols-12 gap-x-6 gap-y-2 py-10 md:py-12",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "col-span-12 md:col-span-3",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "meta-label tabular-nums",
							style: { color: "var(--ink-3)" },
							children: String(i + 1).padStart(2, "0")
						}),
						/* @__PURE__ */ jsx("p", {
							className: "meta-label mt-1",
							style: { color: "var(--ink-4)" },
							children: entry.issue
						}),
						/* @__PURE__ */ jsx("p", {
							className: "meta-label mt-1",
							style: { color: "var(--ink-4)" },
							children: t(entry.dateKey, entry.dateDefault)
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "col-span-12 md:col-span-9",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "font-display text-[clamp(1.5rem,1.2rem+1.4vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.015em] text-foreground",
							children: t(entry.titleKey, entry.titleDefault)
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 max-w-[62ch] text-base leading-[1.65]",
							style: { color: "var(--ink-2)" },
							children: t(entry.dekKey, entry.dekDefault)
						}),
						/* @__PURE__ */ jsx("p", {
							className: "meta-label mt-5",
							style: { color: "var(--ink-3)" },
							children: t(entry.readKey, entry.readDefault)
						})
					]
				})]
			}, entry.id))
		})
	});
}
//#endregion
export { JournalPage as component };
