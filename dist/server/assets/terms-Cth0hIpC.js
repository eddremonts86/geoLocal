import { n as EditorialSection, t as EditorialPage } from "./editorial-page-BJgIyQtx.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
//#region src/routes/_public/terms.tsx?tsr-split=component
function TermsPage() {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsxs(EditorialPage, {
		eyebrow: t("terms.eyebrow", "08 · Terms"),
		title: t("terms.title", "Terms of service."),
		lede: t("terms.lede", "The rules of using GeoLocal. Short, human, and enforceable."),
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "meta-label mb-12",
				style: { color: "var(--ink-4)" },
				children: t("terms.updated", "Last updated · March 2026")
			}),
			/* @__PURE__ */ jsx(EditorialSection, {
				number: "01",
				label: t("terms.s1.label", "Accounts"),
				title: t("terms.s1.title", "One person, one identity."),
				children: /* @__PURE__ */ jsx("p", { children: t("terms.s1.p1", "You must provide truthful information, keep your credentials private, and notify us immediately if your account is compromised. You are responsible for activity under your account.") })
			}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-border" }),
			/* @__PURE__ */ jsxs(EditorialSection, {
				number: "02",
				label: t("terms.s2.label", "Listings"),
				title: t("terms.s2.title", "Real things, fair prices."),
				children: [/* @__PURE__ */ jsx("p", { children: t("terms.s2.p1", "Listings must represent real items or services you have the right to offer. Photos must be yours or licensed. Prices must be the prices you’d actually accept.") }), /* @__PURE__ */ jsx("p", { children: t("terms.s2.p2", "We may remove listings that are misleading, discriminatory, or in breach of Danish or EU law.") })]
			}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-border" }),
			/* @__PURE__ */ jsx(EditorialSection, {
				number: "03",
				label: t("terms.s3.label", "Transactions"),
				title: t("terms.s3.title", "Between you and the other party."),
				children: /* @__PURE__ */ jsx("p", { children: t("terms.s3.p1", "GeoLocal is a discovery surface. Transactions happen between listers and buyers. We do not take a cut and we do not arbitrate disputes beyond providing communication records on request.") })
			}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-border" }),
			/* @__PURE__ */ jsx(EditorialSection, {
				number: "04",
				label: t("terms.s4.label", "Termination"),
				title: t("terms.s4.title", "You can leave, we can end."),
				children: /* @__PURE__ */ jsx("p", { children: t("terms.s4.p1", "You may delete your account at any time. We may suspend accounts that violate these terms, with notice except in cases of ongoing fraud or abuse.") })
			}),
			/* @__PURE__ */ jsx("div", { className: "h-px bg-border" }),
			/* @__PURE__ */ jsx(EditorialSection, {
				number: "05",
				label: t("terms.s5.label", "Jurisdiction"),
				title: t("terms.s5.title", "København, Denmark."),
				children: /* @__PURE__ */ jsx("p", { children: t("terms.s5.p1", "These terms are governed by Danish law and any disputes are resolved in the courts of Copenhagen.") })
			})
		]
	});
}
//#endregion
export { TermsPage as component };
