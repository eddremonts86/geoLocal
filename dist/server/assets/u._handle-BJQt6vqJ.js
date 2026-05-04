import { t as Route } from "./u._handle-Di_Ki_8m.js";
import { n as getPublicProfileByHandleFn, r as listPublicListingsByHandleFn } from "./profile.fn--lv7pBGP.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
//#region src/routes/_public/u.$handle.tsx?tsr-split=component
function PublicProfilePage() {
	const { handle } = Route.useParams();
	const profile = useQuery({
		queryKey: ["public-profile", handle],
		queryFn: () => getPublicProfileByHandleFn({ data: { handle } })
	});
	const listings = useQuery({
		queryKey: ["public-listings", handle],
		queryFn: () => listPublicListingsByHandleFn({ data: { handle } }),
		enabled: Boolean(profile.data)
	});
	if (profile.isLoading) return /* @__PURE__ */ jsx("div", {
		className: "mx-auto max-w-4xl px-6 py-16 text-center text-neutral-500",
		children: "Loading…"
	});
	if (!profile.data) return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-4xl px-6 py-16 text-center",
		children: [/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-semibold",
			children: "User not found"
		}), /* @__PURE__ */ jsx(Link, {
			to: "/explore",
			className: "mt-4 inline-block text-sm underline",
			children: "Browse listings"
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-4xl px-6 py-12",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "mb-10",
				children: [
					/* @__PURE__ */ jsx("h1", {
						className: "text-3xl font-semibold tracking-tight",
						children: profile.data.displayName ?? `@${handle}`
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-1 text-neutral-500",
						children: ["@", profile.data.handle]
					}),
					profile.data.bio && /* @__PURE__ */ jsx("p", {
						className: "mt-4 max-w-2xl whitespace-pre-wrap text-neutral-700 dark:text-neutral-300",
						children: profile.data.bio
					})
				]
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "mb-4 text-xl font-medium",
				children: "Listings"
			}),
			listings.data?.length ? /* @__PURE__ */ jsx("ul", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: listings.data.map((l) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
					to: "/listing/$slug",
					params: { slug: l.slug },
					className: "block rounded-lg border bg-white p-4 transition hover:shadow dark:border-neutral-800 dark:bg-neutral-900",
					children: [
						/* @__PURE__ */ jsx("h3", {
							className: "line-clamp-1 font-medium",
							children: l.subCategory
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-sm text-neutral-500",
							children: [
								l.city,
								", ",
								l.country
							]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-2 text-sm font-semibold",
							children: [
								(l.price / 100).toFixed(2),
								" ",
								l.currency
							]
						})
					]
				}) }, l.id))
			}) : /* @__PURE__ */ jsx("p", {
				className: "text-neutral-500",
				children: "No public listings yet."
			})
		]
	});
}
//#endregion
export { PublicProfilePage as component };
