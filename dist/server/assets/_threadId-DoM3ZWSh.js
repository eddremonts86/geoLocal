import { t as Route } from "./_threadId-DknDG66P.js";
import { i as sendMessageFn, r as markThreadReadFn, t as getThreadFn } from "./messaging.fn-Cr6KLftU.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
//#region src/routes/_account/account/messages/$threadId.tsx?tsr-split=component
function ThreadPage() {
	const { threadId } = Route.useParams();
	const qc = useQueryClient();
	const [body, setBody] = useState("");
	const { data, isLoading } = useQuery({
		queryKey: ["thread", threadId],
		queryFn: () => getThreadFn({ data: { threadId } }),
		refetchInterval: 15e3
	});
	const mark = useMutation({
		mutationFn: () => markThreadReadFn({ data: { threadId } }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["my-threads"] });
			qc.invalidateQueries({ queryKey: ["unread-count"] });
		}
	});
	const send = useMutation({
		mutationFn: (text) => sendMessageFn({ data: {
			threadId,
			body: text
		} }),
		onSuccess: () => {
			setBody("");
			qc.invalidateQueries({ queryKey: ["thread", threadId] });
			qc.invalidateQueries({ queryKey: ["my-threads"] });
		}
	});
	useEffect(() => {
		mark.mutate();
	}, [threadId]);
	if (isLoading) return /* @__PURE__ */ jsx("p", {
		className: "text-sm text-neutral-500",
		children: "Loading…"
	});
	if (!data) return /* @__PURE__ */ jsx("p", {
		className: "text-sm text-neutral-500",
		children: "Thread not found."
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-[calc(100vh-180px)] flex-col rounded-lg border bg-white dark:border-neutral-800 dark:bg-neutral-900",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "border-b p-4 dark:border-neutral-800",
				children: [
					/* @__PURE__ */ jsx(Link, {
						to: "/account/messages",
						className: "text-xs text-neutral-500 hover:underline",
						children: "← Inbox"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-1 text-lg font-medium",
						children: "Conversation"
					}),
					data.thread.listingId && /* @__PURE__ */ jsxs("p", {
						className: "text-xs text-neutral-500",
						children: ["About listing ", /* @__PURE__ */ jsxs("span", {
							className: "font-mono",
							children: [data.thread.listingId.slice(0, 8), "…"]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("ol", {
				className: "flex-1 space-y-3 overflow-y-auto p-4",
				children: [data.messages.map((m) => /* @__PURE__ */ jsxs("li", {
					className: "rounded-md bg-neutral-100 p-3 dark:bg-neutral-800",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "mb-1 flex items-center justify-between text-xs text-neutral-500",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "font-medium",
							children: [m.senderId.slice(0, 12), "…"]
						}), /* @__PURE__ */ jsx("span", { children: new Date(m.createdAt).toLocaleString() })]
					}), /* @__PURE__ */ jsx("p", {
						className: "whitespace-pre-wrap text-sm",
						children: m.body
					})]
				}, m.id)), data.messages.length === 0 && /* @__PURE__ */ jsx("p", {
					className: "text-center text-sm text-neutral-500",
					children: "No messages yet."
				})]
			}),
			/* @__PURE__ */ jsx("form", {
				onSubmit: (e) => {
					e.preventDefault();
					if (body.trim()) send.mutate(body.trim());
				},
				className: "border-t p-3 dark:border-neutral-800",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-end gap-2",
					children: [/* @__PURE__ */ jsx("textarea", {
						value: body,
						onChange: (e) => setBody(e.currentTarget.value),
						rows: 2,
						placeholder: "Write a reply…",
						className: "flex-1 resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950"
					}), /* @__PURE__ */ jsx("button", {
						type: "submit",
						disabled: send.isPending || body.trim().length === 0,
						className: "rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900",
						children: "Send"
					})]
				})
			})
		]
	});
}
//#endregion
export { ThreadPage as component };
