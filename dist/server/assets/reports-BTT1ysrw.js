import { n as listReportsFn, r as moderateListingFn } from "./moderation.fn-CnOUM9at.js";
import { useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
//#region src/routes/_admin/admin/reports.tsx?tsr-split=component
function AdminReportsPage() {
	const qc = useQueryClient();
	const [includeResolved, setIncludeResolved] = useState(false);
	const reports = useQuery({
		queryKey: ["admin-reports", includeResolved],
		queryFn: () => listReportsFn({ data: { resolved: includeResolved } })
	});
	const moderate = useMutation({
		mutationFn: (input) => moderateListingFn({ data: input }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reports"] })
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-medium",
				children: "Reports"
			}), /* @__PURE__ */ jsxs("label", {
				className: "flex items-center gap-2 text-sm",
				children: [/* @__PURE__ */ jsx("input", {
					type: "checkbox",
					checked: includeResolved,
					onChange: (e) => setIncludeResolved(e.currentTarget.checked)
				}), "Include resolved"]
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
							children: "Listing"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Reporter"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Reason"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Resolved?"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Created"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "px-4 py-3",
							children: "Actions"
						})
					] })
				}), /* @__PURE__ */ jsxs("tbody", { children: [reports.data?.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
					colSpan: 6,
					className: "px-4 py-12 text-center text-neutral-500",
					children: "No reports."
				}) }), reports.data?.map((r) => {
					const resolved = Boolean(r.resolvedAt);
					return /* @__PURE__ */ jsxs("tr", {
						className: "border-b align-top last:border-b-0 dark:border-neutral-800",
						children: [
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3 font-mono text-xs",
								children: r.listingSlug ?? `${r.listingId.slice(0, 8)}…`
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "px-4 py-3 font-mono text-xs",
								children: [(r.reporterId ?? "—").slice(0, 8), "…"]
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "px-4 py-3",
								children: [/* @__PURE__ */ jsx("div", {
									className: "font-medium",
									children: r.reason
								}), r.details && /* @__PURE__ */ jsx("div", {
									className: "mt-1 text-xs text-neutral-500",
									children: r.details
								})]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3",
								children: resolved ? "yes" : "no"
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3 text-neutral-500",
								children: new Date(r.createdAt).toLocaleString()
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3 space-x-2",
								children: !resolved && /* @__PURE__ */ jsxs(Fragment, { children: [
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => moderate.mutate({
											id: r.listingId,
											moderationStatus: "hidden",
											resolveReports: true
										}),
										className: "text-xs font-medium text-amber-600 hover:text-amber-700",
										children: "Hide"
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => moderate.mutate({
											id: r.listingId,
											moderationStatus: "banned",
											resolveReports: true
										}),
										className: "text-xs font-medium text-red-600 hover:text-red-700",
										children: "Ban listing"
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => moderate.mutate({
											id: r.listingId,
											moderationStatus: "ok",
											resolveReports: true
										}),
										className: "text-xs font-medium text-emerald-600 hover:text-emerald-700",
										children: "Dismiss"
									})
								] })
							})
						]
					}, r.id);
				})] })]
			})
		})]
	});
}
//#endregion
export { AdminReportsPage as component };
