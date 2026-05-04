import { t as createServerFn } from "../server.js";
import { t as createSsrRpc } from "./createSsrRpc-BWHnVJ-F.js";
import { t as banUserFn } from "./moderation.fn-CnOUM9at.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
//#region src/routes/_admin/admin/users.tsx?tsr-split=component
/**
* Admin → users.
*
* Lists known user_profiles rows (anyone who has signed in at least once) and
* lets admins ban / unban accounts. Banning is delegated to `banUserFn`, which
* also archives all of the user's listings.
*/
var listUsersFn = createServerFn({ method: "GET" }).inputValidator(z.object({ q: z.string().max(100).optional() }).optional()).handler(createSsrRpc("4174cf29acf4ec80d5532e79f8f4720c9b0c4c3bed82765f23de7a9912e8c345"));
function AdminUsersPage() {
	const qc = useQueryClient();
	const [q, setQ] = useState("");
	const [committedQ, setCommittedQ] = useState("");
	const users = useQuery({
		queryKey: ["admin-users", committedQ],
		queryFn: () => listUsersFn({ data: { q: committedQ || void 0 } })
	});
	const ban = useMutation({
		mutationFn: (input) => banUserFn({ data: input }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] })
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between gap-4",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-medium",
				children: "Users"
			}), /* @__PURE__ */ jsxs("form", {
				onSubmit: (e) => {
					e.preventDefault();
					setCommittedQ(q.trim());
				},
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("input", {
					value: q,
					onChange: (e) => setQ(e.currentTarget.value),
					placeholder: "Search by handle, name, email, id…",
					className: "w-72 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950"
				}), /* @__PURE__ */ jsx("button", {
					type: "submit",
					className: "rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-900",
					children: "Search"
				})]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "overflow-hidden rounded-lg border bg-white dark:border-neutral-800 dark:bg-neutral-900",
			children: /* @__PURE__ */ jsxs("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ jsx("thead", {
					className: "border-b text-left text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-800",
					children: /* @__PURE__ */ jsxs("tr", { children: [
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "User"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Email"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Role"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Status"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Joined"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Actions"
						})
					] })
				}), /* @__PURE__ */ jsxs("tbody", { children: [
					users.isLoading && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
						colSpan: 6,
						className: "px-4 py-12 text-center text-neutral-500",
						children: "Loading…"
					}) }),
					users.data?.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
						colSpan: 6,
						className: "px-4 py-12 text-center text-neutral-500",
						children: "No users."
					}) }),
					users.data?.map((u) => {
						const banned = Boolean(u.bannedAt);
						return /* @__PURE__ */ jsxs("tr", {
							className: "border-b align-top last:border-b-0 dark:border-neutral-800",
							children: [
								/* @__PURE__ */ jsxs("td", {
									className: "px-4 py-3",
									children: [/* @__PURE__ */ jsx("div", {
										className: "font-medium",
										children: u.displayName ?? u.handle ?? "—"
									}), /* @__PURE__ */ jsx("div", {
										className: "text-xs text-neutral-500",
										children: u.handle ? `@${u.handle}` : u.userId
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-4 py-3 text-neutral-500",
									children: u.email ?? "—"
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-4 py-3",
									children: u.role
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-4 py-3",
									children: banned ? /* @__PURE__ */ jsx("span", {
										className: "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300",
										children: "banned"
									}) : /* @__PURE__ */ jsx("span", {
										className: "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
										children: "active"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-4 py-3 text-neutral-500",
									children: new Date(u.createdAt).toLocaleDateString()
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-4 py-3",
									children: banned ? /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => ban.mutate({
											userId: u.userId,
											reason: "",
											banned: false
										}),
										className: "text-xs font-medium text-emerald-600 hover:text-emerald-700",
										children: "Unban"
									}) : /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => {
											const reason = prompt("Reason for ban?") ?? "";
											if (reason.trim().length > 0) ban.mutate({
												userId: u.userId,
												reason: reason.trim(),
												banned: true
											});
										},
										className: "text-xs font-medium text-red-600 hover:text-red-700",
										children: "Ban"
									})
								})
							]
						}, u.userId);
					})
				] })]
			})
		})]
	});
}
//#endregion
export { AdminUsersPage as component };
