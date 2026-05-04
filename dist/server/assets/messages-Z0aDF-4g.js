import { n as listThreadsFn } from "./messaging.fn-Cr6KLftU.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
//#region src/routes/_account/account/messages/index.tsx?tsr-split=component
function InboxPage() {
	const { data, isLoading } = useQuery({
		queryKey: ["my-threads"],
		queryFn: () => listThreadsFn(),
		refetchInterval: 3e4
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-semibold",
			children: "Messages"
		}), /* @__PURE__ */ jsx("p", {
			className: "text-sm text-neutral-500",
			children: "Conversations about your listings or listings you contacted."
		})] }), /* @__PURE__ */ jsxs("div", {
			className: "overflow-hidden rounded-lg border bg-white dark:border-neutral-800 dark:bg-neutral-900",
			children: [
				isLoading && /* @__PURE__ */ jsx("p", {
					className: "p-8 text-center text-neutral-500",
					children: "Loading…"
				}),
				data?.length === 0 && /* @__PURE__ */ jsx("p", {
					className: "p-8 text-center text-neutral-500",
					children: "No conversations yet."
				}),
				/* @__PURE__ */ jsx("ul", { children: data?.map((t) => /* @__PURE__ */ jsx("li", {
					className: "border-b last:border-b-0 dark:border-neutral-800",
					children: /* @__PURE__ */ jsxs(Link, {
						to: "/account/messages/$threadId",
						params: { threadId: t.threadId },
						className: "flex items-center justify-between gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-950",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [
									t.unread && /* @__PURE__ */ jsx("span", { className: "size-2 rounded-full bg-amber-500" }),
									/* @__PURE__ */ jsx("span", {
										className: "font-medium",
										children: "Conversation"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-xs text-neutral-500",
										children: new Date(t.lastMessageAt).toLocaleString()
									})
								]
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-1 truncate text-sm text-neutral-500",
								children: t.lastMessagePreview ?? "(no messages)"
							})]
						}), /* @__PURE__ */ jsx("span", {
							className: "text-xs text-neutral-500",
							children: t.status
						})]
					})
				}, t.threadId)) })
			]
		})]
	});
}
//#endregion
export { InboxPage as component };
