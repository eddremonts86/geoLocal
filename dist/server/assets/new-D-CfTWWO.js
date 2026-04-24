import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
//#region src/routes/_admin/admin/listings/new.tsx
var $$splitComponentImporter = () => import("./new-BCRU5StJ.js");
var searchSchema = z.object({ category: z.string().optional() });
var Route = createFileRoute("/_admin/admin/listings/new")({
	validateSearch: searchSchema,
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
