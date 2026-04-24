import { t as Route } from "./new-D-CfTWWO.js";
import { t as ListingFormPage } from "./ListingFormPage-BFN7gQ2t.js";
import { jsx } from "react/jsx-runtime";
//#region src/routes/_admin/admin/listings/new.tsx?tsr-split=component
function NewListingRoute() {
	const { category } = Route.useSearch();
	return /* @__PURE__ */ jsx(ListingFormPage, { initialCategory: category });
}
//#endregion
export { NewListingRoute as component };
