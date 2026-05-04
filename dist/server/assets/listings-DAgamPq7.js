import { i as publishListingFn, n as deleteListingFn, r as listMyListingsFn } from "./listings-mutations.fn-_qQxbbbG.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
//#region src/routes/_account/account/listings/index.tsx?tsr-split=component
function MyListingsPage() {
	const qc = useQueryClient();
	const { data, isLoading } = useQuery({
		queryKey: ["my-listings"],
		queryFn: () => listMyListingsFn()
	});
	const publish = useMutation({
		mutationFn: (input) => publishListingFn({ data: input }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["my-listings"] })
	});
	const remove = useMutation({
		mutationFn: (id) => deleteListingFn({ data: { id } }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["my-listings"] })
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-semibold",
				children: "My listings"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-neutral-500",
				children: "Create, edit, publish or archive your listings."
			})] }), /* @__PURE__ */ jsx(Link, {
				to: "/account/listings/new",
				className: "rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900",
				children: "+ New listing"
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
							children: "Title / Slug"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Category"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Status"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Views"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Contacts"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Updated"
						}),
						/* @__PURE__ */ jsx("th", { className: "px-4 py-3" })
					] })
				}), /* @__PURE__ */ jsxs("tbody", { children: [
					isLoading && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
						colSpan: 7,
						className: "px-4 py-12 text-center text-neutral-500",
						children: "Loading…"
					}) }),
					data?.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
						colSpan: 7,
						className: "px-4 py-12 text-center text-neutral-500",
						children: "Nothing here yet — create your first listing."
					}) }),
					data?.map((l) => /* @__PURE__ */ jsxs("tr", {
						className: "border-b last:border-b-0 dark:border-neutral-800",
						children: [
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ jsx(Link, {
									to: "/account/listings/$id",
									params: { id: l.id },
									className: "font-medium hover:underline",
									children: l.slug
								})
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "px-4 py-3 text-neutral-500",
								children: [
									l.category,
									"/",
									l.subCategory
								]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ jsx(Badge, {
									status: l.status,
									moderation: l.moderationStatus
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3 text-neutral-500",
								children: l.viewCount
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3 text-neutral-500",
								children: l.contactCount
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3 text-neutral-500",
								children: new Date(l.updatedAt).toLocaleDateString()
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "px-4 py-3 text-right space-x-2",
								children: [l.status === "draft" ? /* @__PURE__ */ jsx("button", {
									type: "button",
									className: "text-xs font-medium text-emerald-600 hover:text-emerald-700",
									onClick: () => publish.mutate({
										id: l.id,
										publish: true
									}),
									children: "Publish"
								}) : /* @__PURE__ */ jsx("button", {
									type: "button",
									className: "text-xs font-medium text-amber-600 hover:text-amber-700",
									onClick: () => publish.mutate({
										id: l.id,
										publish: false
									}),
									children: "Unpublish"
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									className: "text-xs font-medium text-red-600 hover:text-red-700",
									onClick: () => {
										if (confirm("Delete this listing? Published listings will be archived.")) remove.mutate(l.id);
									},
									children: "Delete"
								})]
							})
						]
					}, l.id))
				] })]
			})
		})]
	});
}
function Badge({ status, moderation }) {
	if (moderation !== "ok") return /* @__PURE__ */ jsx("span", {
		className: "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300",
		children: moderation
	});
	return /* @__PURE__ */ jsx("span", {
		className: `rounded-full px-2 py-0.5 text-xs font-medium ${status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : status === "draft" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"}`,
		children: status
	});
}
//#endregion
export { MyListingsPage as component };
