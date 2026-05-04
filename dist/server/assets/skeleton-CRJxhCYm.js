import { t as cn } from "./utils-C17k1q7P.js";
import { jsx } from "react/jsx-runtime";
//#region src/components/ui/skeleton.tsx
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "skeleton",
		className: cn("animate-pulse rounded-md bg-accent", className),
		...props
	});
}
//#endregion
export { Skeleton as t };
