import { i as updateMyProfileFn, t as getMyProfileFn } from "./profile.fn--lv7pBGP.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
//#region src/routes/_account/account/profile.tsx?tsr-split=component
function ProfilePage() {
	const qc = useQueryClient();
	const { data } = useQuery({
		queryKey: ["my-profile"],
		queryFn: () => getMyProfileFn()
	});
	const [form, setForm] = useState({
		handle: "",
		displayName: "",
		bio: "",
		email: "",
		phone: "",
		notificationsEmail: true
	});
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState(null);
	useEffect(() => {
		if (!data) return;
		setForm({
			handle: data.handle ?? "",
			displayName: data.displayName ?? "",
			bio: data.bio ?? "",
			email: data.email ?? "",
			phone: data.phone ?? "",
			notificationsEmail: data.notificationsEmail ?? true
		});
	}, [data]);
	const update = useMutation({
		mutationFn: (input) => updateMyProfileFn({ data: {
			...input,
			handle: input.handle.trim() === "" ? void 0 : input.handle.trim().toLowerCase(),
			displayName: input.displayName || void 0,
			bio: input.bio || void 0,
			email: input.email || void 0,
			phone: input.phone || void 0
		} }),
		onSuccess: () => {
			setSaved(true);
			setError(null);
			qc.invalidateQueries({ queryKey: ["my-profile"] });
			window.setTimeout(() => setSaved(false), 2e3);
		},
		onError: (e) => setError(e.message ?? "Could not save")
	});
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: (e) => {
			e.preventDefault();
			update.mutate(form);
		},
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-semibold",
				children: "Profile"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-neutral-500",
				children: "How you appear to other users."
			})] }),
			/* @__PURE__ */ jsxs(Card, { children: [
				/* @__PURE__ */ jsx(Field, {
					label: "Handle (your /u/<handle> URL)",
					hint: "2–40 chars, lowercase, letters/digits/-/_",
					children: /* @__PURE__ */ jsx(Input, {
						value: form.handle,
						onChange: (v) => setForm((f) => ({
							...f,
							handle: v
						})),
						placeholder: "janedoe"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Display name",
					children: /* @__PURE__ */ jsx(Input, {
						value: form.displayName,
						onChange: (v) => setForm((f) => ({
							...f,
							displayName: v
						}))
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Bio",
					children: /* @__PURE__ */ jsx(Textarea, {
						value: form.bio,
						onChange: (v) => setForm((f) => ({
							...f,
							bio: v
						})),
						rows: 4,
						maxLength: 2e3
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Email (where notifications are sent)",
					children: /* @__PURE__ */ jsx(Input, {
						type: "email",
						value: form.email,
						onChange: (v) => setForm((f) => ({
							...f,
							email: v
						}))
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "Phone",
					children: /* @__PURE__ */ jsx(Input, {
						value: form.phone,
						onChange: (v) => setForm((f) => ({
							...f,
							phone: v
						}))
					})
				}),
				/* @__PURE__ */ jsxs("label", {
					className: "flex items-center gap-3 text-sm",
					children: [/* @__PURE__ */ jsx("input", {
						type: "checkbox",
						checked: form.notificationsEmail,
						onChange: (e) => setForm((f) => ({
							...f,
							notificationsEmail: e.currentTarget.checked
						}))
					}), "Send me email notifications for new messages and listing alerts"]
				})
			] }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-end gap-3",
				children: [
					saved && /* @__PURE__ */ jsx("span", {
						className: "text-sm text-emerald-600",
						children: "Saved"
					}),
					error && /* @__PURE__ */ jsx("span", {
						className: "text-sm text-red-600",
						children: error
					}),
					/* @__PURE__ */ jsx("button", {
						type: "submit",
						disabled: update.isPending,
						className: "rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900",
						children: update.isPending ? "Saving…" : "Save changes"
					})
				]
			})
		]
	});
}
function Card({ children }) {
	return /* @__PURE__ */ jsx("div", {
		className: "space-y-4 rounded-lg border bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900",
		children
	});
}
function Field({ label, hint, children }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "block",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400",
				children: label
			}),
			children,
			hint && /* @__PURE__ */ jsx("span", {
				className: "mt-1 block text-xs text-neutral-500",
				children: hint
			})
		]
	});
}
var inputCls = "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";
function Input({ value, onChange, ...rest }) {
	return /* @__PURE__ */ jsx("input", {
		...rest,
		value,
		onChange: (e) => onChange(e.currentTarget.value),
		className: inputCls
	});
}
function Textarea({ value, onChange, ...rest }) {
	return /* @__PURE__ */ jsx("textarea", {
		...rest,
		value,
		onChange: (e) => onChange(e.currentTarget.value),
		className: inputCls
	});
}
//#endregion
export { ProfilePage as component };
