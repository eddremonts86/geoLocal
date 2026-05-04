import { r as listMyListingsFn } from "./listings-mutations.fn-_qQxbbbG.js";
import { n as listThreadsFn, o as unreadNotificationsCountFn } from "./messaging.fn-Cr6KLftU.js";
import { i as listMyPaymentsFn } from "./payments.fn-bZdLCV6M.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
//#region src/routes/_account/account/index.tsx?tsr-split=component
function AccountOverview() {
	const listings = useQuery({
		queryKey: ["my-listings"],
		queryFn: () => listMyListingsFn()
	});
	const threads = useQuery({
		queryKey: ["my-threads"],
		queryFn: () => listThreadsFn()
	});
	const unread = useQuery({
		queryKey: ["unread-count"],
		queryFn: () => unreadNotificationsCountFn(),
		refetchInterval: 3e4
	});
	const payments = useQuery({
		queryKey: ["my-payments", "both"],
		queryFn: () => listMyPaymentsFn({ data: { side: "both" } })
	});
	const published = (listings.data ?? []).filter((l) => l.status === "published").length;
	const drafts = (listings.data ?? []).filter((l) => l.status === "draft").length;
	const totalEarnings = (payments.data ?? []).filter((p) => p.status === "succeeded" && p.sellerId).reduce((sum, p) => sum + p.amountTotal - p.amountApplicationFee, 0);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h1", {
				className: "text-3xl font-semibold tracking-tight",
				children: "Welcome back"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-neutral-500",
				children: "Here’s what’s happening across your account."
			})] }),
			/* @__PURE__ */ jsxs("section", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ jsx(Stat, {
						label: "Published",
						value: published
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "Drafts",
						value: drafts
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "Unread messages",
						value: unread.data ?? 0,
						highlight: Boolean(unread.data && unread.data > 0)
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "Earnings",
						value: `${(totalEarnings / 100).toFixed(2)} DKK`
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ jsxs(Card, {
					title: "Your listings",
					cta: {
						to: "/account/listings",
						label: "Manage →"
					},
					children: [(listings.data ?? []).slice(0, 5).map((l) => /* @__PURE__ */ jsxs(Link, {
						to: "/account/listings/$id",
						params: { id: l.id },
						className: "flex items-center justify-between rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900",
						children: [/* @__PURE__ */ jsx("span", {
							className: "truncate text-sm",
							children: l.subCategory
						}), /* @__PURE__ */ jsx("span", {
							className: "text-xs text-neutral-500",
							children: l.status
						})]
					}, l.id)), !listings.data?.length && /* @__PURE__ */ jsx(EmptyState, { text: "No listings yet." })]
				}), /* @__PURE__ */ jsxs(Card, {
					title: "Recent conversations",
					cta: {
						to: "/account/messages",
						label: "Open inbox →"
					},
					children: [(threads.data ?? []).slice(0, 5).map((t) => /* @__PURE__ */ jsxs(Link, {
						to: "/account/messages/$threadId",
						params: { threadId: t.threadId },
						className: "block rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-sm font-medium",
								children: [t.unread ? "● " : "", "Listing thread"]
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xs text-neutral-500",
								children: new Date(t.lastMessageAt).toLocaleDateString()
							})]
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 truncate text-xs text-neutral-500",
							children: t.lastMessagePreview ?? "(no messages)"
						})]
					}, t.threadId)), !threads.data?.length && /* @__PURE__ */ jsx(EmptyState, { text: "No conversations yet." })]
				})]
			}),
			/* @__PURE__ */ jsx("section", { children: /* @__PURE__ */ jsx(Link, {
				to: "/account/listings/new",
				className: "inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200",
				children: "+ Create a new listing"
			}) })
		]
	});
}
function Stat({ label, value, highlight }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 ${highlight ? "ring-2 ring-amber-400" : ""}`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-xs uppercase tracking-wider text-neutral-500",
			children: label
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-2 text-2xl font-semibold",
			children: value
		})]
	});
}
function Card({ title, children, cta }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-lg border bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-4 flex items-center justify-between",
			children: [/* @__PURE__ */ jsx("h3", {
				className: "font-medium",
				children: title
			}), cta && /* @__PURE__ */ jsx(Link, {
				to: cta.to,
				className: "text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
				children: cta.label
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "space-y-1",
			children
		})]
	});
}
function EmptyState({ text }) {
	return /* @__PURE__ */ jsx("p", {
		className: "px-2 py-4 text-sm text-neutral-500",
		children: text
	});
}
//#endregion
export { AccountOverview as component };
