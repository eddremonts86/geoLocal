import { n as EditorialSection, t as EditorialPage } from "./editorial-page-CY375GEt.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
//#region src/routes/_public/privacy.tsx?tsr-split=component
function PrivacyPage() {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsxs(EditorialPage, {
		eyebrow: t("privacy.eyebrow", "07 · Privacy"),
		title: t("privacy.title", "Privacy policy."),
		lede: t("privacy.lede", "What we collect, why, and how long we keep it. Written in plain language, updated when the data changes."),
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "meta-label mb-12",
				style: { color: "var(--ink-4)" },
				children: t("privacy.updated", "Last updated · March 2026")
			}),
			/* @__PURE__ */ jsxs(EditorialSection, {
				number: "01",
				label: t("privacy.s1.label", "What we collect"),
				title: t("privacy.s1.title", "Only what a marketplace needs."),
				children: [/* @__PURE__ */ jsx("p", { children: t("privacy.s1.p1", "We collect account information (email, display name), listings you publish or favourite, and basic device telemetry (viewport, language, timezone).") }), /* @__PURE__ */ jsx("p", { children: t("privacy.s1.p2", "We do not sell this data, and we do not use third-party ad trackers. Map tiles are served from OpenFreeMap, a non-profit service.") })]
			}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-border" }),
			/* @__PURE__ */ jsx(EditorialSection, {
				number: "02",
				label: t("privacy.s2.label", "How we use it"),
				title: t("privacy.s2.title", "Running the product, nothing else."),
				children: /* @__PURE__ */ jsx("p", { children: t("privacy.s2.p1", "We use personal data to authenticate you, to let you manage your listings and favourites, and to aggregate anonymous metrics about which neighbourhoods are trending.") })
			}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-border" }),
			/* @__PURE__ */ jsx(EditorialSection, {
				number: "03",
				label: t("privacy.s3.label", "Your rights"),
				title: t("privacy.s3.title", "Access, correct, export, delete."),
				children: /* @__PURE__ */ jsx("p", { children: t("privacy.s3.p1", "Under GDPR you may request a copy of your data, ask us to correct it, export it in a portable format, or delete your account entirely. Write to privacy@geolocal.cph and we reply within 30 days.") })
			}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-border" }),
			/* @__PURE__ */ jsx(EditorialSection, {
				number: "04",
				label: t("privacy.s4.label", "Retention"),
				title: t("privacy.s4.title", "We keep less than you’d expect."),
				children: /* @__PURE__ */ jsx("p", { children: t("privacy.s4.p1", "Inactive accounts are purged after 24 months. Expired listings are anonymised after 6 months. Server logs rotate every 30 days.") })
			})
		]
	});
}
//#endregion
export { PrivacyPage as component };
