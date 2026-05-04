import { t as cn } from "./utils-C17k1q7P.js";
import "react";
import { jsx } from "react/jsx-runtime";
import { Label } from "radix-ui";
//#region src/components/ui/label.tsx
function Label$1({ className, ...props }) {
	return /* @__PURE__ */ jsx(Label.Root, {
		"data-slot": "label",
		className: cn("text-sm font-medium leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { Label$1 as t };
