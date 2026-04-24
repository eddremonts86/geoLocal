import { n as EditorialSection, t as EditorialPage } from "./editorial-page-CY375GEt.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
//#region src/routes/_public/about.tsx?tsr-split=component
function AboutPage() {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsxs(EditorialPage, {
		eyebrow: t("about.eyebrow", "03 · Company"),
		title: t("about.title", "A marketplace drawn on the map."),
		lede: t("about.lede", "GeoLocal is an editorial marketplace for Copenhagen — a quiet, map-first way to find properties, vehicles, and services in the city and its harbour."),
		children: [
			/* @__PURE__ */ jsx(EditorialSection, {
				number: "01",
				label: t("about.principleLabel", "Principle"),
				title: t("about.principleTitle", "The map is the index."),
				children: /* @__PURE__ */ jsx("p", { children: t("about.principleBody", "Most marketplaces bury their listings in filters and feeds. We believe the map itself is the best index — a first-class surface where place, price, and provenance are legible at a glance.") })
			}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-border" }),
			/* @__PURE__ */ jsx(EditorialSection, {
				number: "02",
				label: t("about.craftLabel", "Craft"),
				title: t("about.craftTitle", "Editorial, not algorithmic."),
				children: /* @__PURE__ */ jsx("p", { children: t("about.craftBody", "We curate our featured listings weekly, the way a magazine would. Fraunces sets the headlines, Geist keeps the body quiet, and JetBrains Mono handles the numbers.") })
			}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-border" }),
			/* @__PURE__ */ jsx(EditorialSection, {
				number: "03",
				label: t("about.placeLabel", "Place"),
				title: t("about.placeTitle", "Copenhagen, first."),
				children: /* @__PURE__ */ jsx("p", { children: t("about.placeBody", "We started in Copenhagen because the city rewards attention: its neighbourhoods have character, its listings have stories, and its residents have taste. We will travel from here.") })
			})
		]
	});
}
//#endregion
export { AboutPage as component };
