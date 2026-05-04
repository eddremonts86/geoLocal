import { t as Route } from "./_id-CSQcMhRJ.js";
import { r as listMyListingsFn } from "./listings-mutations.fn-_qQxbbbG.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
//#region src/routes/_account/account/listings/$id.tsx?tsr-split=component
function ListingEditPage() {
	const { id } = Route.useParams();
	const { data } = useQuery({
		queryKey: ["my-listings"],
		queryFn: () => listMyListingsFn()
	});
	const listing = (data ?? []).find((l) => l.id === id);
	if (!listing) return /* @__PURE__ */ jsxs("div", {
		className: "rounded-lg border bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-neutral-500",
			children: "Listing not found or not owned by you."
		}), /* @__PURE__ */ jsx(Link, {
			to: "/account/listings",
			className: "mt-4 inline-block text-sm underline",
			children: "← Back to listings"
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-semibold",
				children: listing.slug
			}), /* @__PURE__ */ jsxs("p", {
				className: "text-sm text-neutral-500",
				children: [
					listing.category,
					" · ",
					listing.subCategory,
					" · ",
					listing.status
				]
			})] }),
			/* @__PURE__ */ jsx("div", {
				className: "rounded-lg border bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900",
				children: /* @__PURE__ */ jsxs("dl", {
					className: "grid grid-cols-2 gap-4 text-sm",
					children: [
						/* @__PURE__ */ jsx(Row, {
							label: "Price",
							value: `${(listing.price / 100).toFixed(2)} ${listing.currency}`
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "City",
							value: `${listing.city}, ${listing.country}`
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Status",
							value: listing.status
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Moderation",
							value: listing.moderationStatus
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Views",
							value: listing.viewCount.toString()
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Contacts",
							value: listing.contactCount.toString()
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Updated",
							value: new Date(listing.updatedAt).toLocaleString()
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Published",
							value: listing.publishedAt ? new Date(listing.publishedAt).toLocaleString() : "—"
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "text-xs text-neutral-500",
				children: [
					"Detailed editing UI ships in the next iteration. For now, delete and recreate to change category-specific fields.",
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx(Link, {
						to: "/account/listings",
						className: "underline",
						children: "← Back to my listings"
					})
				]
			})
		]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
		className: "text-xs uppercase tracking-wider text-neutral-500",
		children: label
	}), /* @__PURE__ */ jsx("dd", {
		className: "mt-1 font-medium",
		children: value
	})] });
}
//#endregion
export { ListingEditPage as component };
