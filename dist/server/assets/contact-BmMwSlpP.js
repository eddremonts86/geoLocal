import { t as EditorialPage } from "./editorial-page-BJgIyQtx.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
//#region src/routes/_public/contact.tsx?tsr-split=component
function ContactPage() {
	const { t } = useTranslation();
	return /* @__PURE__ */ jsx(EditorialPage, {
		eyebrow: t("contact.eyebrow", "06 · Contact"),
		title: t("contact.title", "Write us a note."),
		lede: t("contact.lede", "Questions about a listing, partnerships, or simply saying hello — we read every message and reply within two working days."),
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-12 gap-x-6 gap-y-14",
			children: [/* @__PURE__ */ jsxs("aside", {
				className: "col-span-12 md:col-span-5",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "meta-label mb-6",
						style: { color: "var(--ink-3)" },
						children: t("contact.channelsLabel", "Channels")
					}),
					/* @__PURE__ */ jsxs("ul", {
						className: "space-y-6",
						children: [
							/* @__PURE__ */ jsx(ChannelRow, {
								icon: Mail,
								label: t("contact.mailLabel", "Email"),
								value: "hello@geolocal.cph",
								href: "mailto:hello@geolocal.cph"
							}),
							/* @__PURE__ */ jsx(ChannelRow, {
								icon: Phone,
								label: t("contact.phoneLabel", "Phone"),
								value: "+45 3216 5555",
								href: "tel:+4532165555"
							}),
							/* @__PURE__ */ jsx(ChannelRow, {
								icon: MapPin,
								label: t("contact.studioLabel", "Studio"),
								value: "Gothersgade 14, 1123 København K"
							})
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "meta-label mt-10",
						style: { color: "var(--ink-4)" },
						children: t("contact.hoursLabel", "Monday–Friday · 09:00–17:00 CET")
					})
				]
			}), /* @__PURE__ */ jsxs("form", {
				className: "col-span-12 space-y-8 md:col-span-7",
				onSubmit: (e) => {
					e.preventDefault();
				},
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 gap-6 md:grid-cols-2",
						children: [/* @__PURE__ */ jsx(FormField, {
							label: t("contact.form.name", "Name"),
							name: "name",
							required: true
						}), /* @__PURE__ */ jsx(FormField, {
							label: t("contact.form.email", "Email"),
							name: "email",
							type: "email",
							required: true
						})]
					}),
					/* @__PURE__ */ jsx(FormField, {
						label: t("contact.form.subject", "Subject"),
						name: "subject"
					}),
					/* @__PURE__ */ jsx(FormTextArea, {
						label: t("contact.form.message", "Message"),
						name: "message",
						required: true
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between gap-4 pt-2",
						children: [/* @__PURE__ */ jsx("p", {
							className: "meta-label",
							style: { color: "var(--ink-4)" },
							children: t("contact.form.privacy", "We respect your privacy.")
						}), /* @__PURE__ */ jsxs("button", {
							type: "submit",
							className: "group inline-flex items-center gap-2 bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[var(--amber)] hover:text-[var(--surface-0)]",
							children: [t("contact.form.send", "Send message"), /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" })]
						})]
					})
				]
			})]
		})
	});
}
function ChannelRow({ icon: Icon, label, value, href }) {
	const content = /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Icon, {
		className: "h-4 w-4",
		strokeWidth: 1.5,
		style: { color: "var(--ink-3)" }
	}), /* @__PURE__ */ jsxs("div", {
		className: "min-w-0 flex-1",
		children: [/* @__PURE__ */ jsx("p", {
			className: "meta-label",
			style: { color: "var(--ink-3)" },
			children: label
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-1 text-base text-foreground",
			children: value
		})]
	})] });
	return /* @__PURE__ */ jsx("li", { children: href ? /* @__PURE__ */ jsxs("a", {
		href,
		className: "group flex items-start gap-4 border-b border-border pb-5 transition-colors hover:border-[var(--amber)]",
		children: [content, /* @__PURE__ */ jsx(ArrowUpRight, {
			className: "h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
			style: { color: "var(--ink-3)" }
		})]
	}) : /* @__PURE__ */ jsx("div", {
		className: "flex items-start gap-4 border-b border-border pb-5",
		children: content
	}) });
}
function FormField({ label, name, type = "text", required }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "block",
		children: [/* @__PURE__ */ jsxs("span", {
			className: "meta-label",
			style: { color: "var(--ink-3)" },
			children: [label, required && /* @__PURE__ */ jsx("span", {
				style: { color: "var(--amber-ink)" },
				children: " *"
			})]
		}), /* @__PURE__ */ jsx("input", {
			name,
			type,
			required,
			className: "mt-2 w-full border-b border-border bg-transparent py-2 text-base text-foreground outline-none transition-colors focus:border-foreground"
		})]
	});
}
function FormTextArea({ label, name, required }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "block",
		children: [/* @__PURE__ */ jsxs("span", {
			className: "meta-label",
			style: { color: "var(--ink-3)" },
			children: [label, required && /* @__PURE__ */ jsx("span", {
				style: { color: "var(--amber-ink)" },
				children: " *"
			})]
		}), /* @__PURE__ */ jsx("textarea", {
			name,
			required,
			rows: 5,
			className: "mt-2 w-full resize-none border-b border-border bg-transparent py-2 text-base text-foreground outline-none transition-colors focus:border-foreground"
		})]
	});
}
//#endregion
export { ContactPage as component };
