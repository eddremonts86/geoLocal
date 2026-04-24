import { t as Badge } from "./badge-CU7K8A-s.js";
import { t as Button } from "./button-DX0eJ04i.js";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-B8NGx3EZ.js";
import { t as createListingFn } from "./admin-listings.fn-x63yI3Wx.js";
import { t as Input } from "./input-DIdDhyf2.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CqwaSWzq.js";
import { t as Separator } from "./separator-C7fmWKHk.js";
import { i as VEHICLE_SUBCATEGORIES, n as PROPERTY_SUBCATEGORIES, r as SERVICE_SUBCATEGORIES } from "./types-5CiJ0onh.js";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Check, ChevronLeft, ChevronRight, Loader2, Save } from "lucide-react";
//#region src/modules/admin/ui/ListingFormPage.tsx
var STEPS = [
	"Category",
	"Details",
	"Specifics",
	"Location",
	"Images",
	"Review"
];
var defaultForm = {
	category: "property",
	subCategory: "",
	transactionType: "buy",
	titleEn: "",
	titleEs: "",
	summaryEn: "",
	descriptionEn: "",
	descriptionEs: "",
	price: 0,
	currency: "DKK",
	pricePeriod: null,
	latitude: 55.6761,
	longitude: 12.5683,
	addressLine1: "",
	city: "Copenhagen",
	region: "",
	country: "Denmark",
	featured: false,
	bedrooms: null,
	bathrooms: null,
	areaSqm: null,
	yearBuilt: null,
	parkingSpaces: null,
	furnished: false,
	make: "",
	model: "",
	year: (/* @__PURE__ */ new Date()).getFullYear(),
	mileageKm: null,
	fuelType: "",
	transmission: "",
	color: "",
	serviceRadiusKm: null,
	experienceYears: null,
	responseTime: "",
	imageUrls: [],
	coverIndex: 0
};
function ListingFormPage({ initialCategory }) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [step, setStep] = useState(0);
	const [form, setForm] = useState(() => ({
		...defaultForm,
		category: initialCategory || "property"
	}));
	const [newImageUrl, setNewImageUrl] = useState("");
	const mutation = useMutation({
		mutationFn: (status) => createListingFn({ data: {
			category: form.category,
			subCategory: form.subCategory,
			transactionType: form.transactionType,
			status,
			price: form.price,
			currency: form.currency,
			pricePeriod: form.pricePeriod,
			latitude: form.latitude,
			longitude: form.longitude,
			addressLine1: form.addressLine1,
			city: form.city,
			region: form.region || null,
			country: form.country,
			featured: form.featured,
			translations: [{
				locale: "en",
				title: form.titleEn,
				summary: form.summaryEn || null,
				description: form.descriptionEn || null,
				neighborhood: null
			}, ...form.titleEs ? [{
				locale: "es",
				title: form.titleEs,
				summary: null,
				description: form.descriptionEs || null,
				neighborhood: null
			}] : []],
			...form.category === "property" ? {
				bedrooms: form.bedrooms,
				bathrooms: form.bathrooms,
				areaSqm: form.areaSqm,
				yearBuilt: form.yearBuilt,
				parkingSpaces: form.parkingSpaces,
				furnished: form.furnished
			} : {},
			...form.category === "vehicle" ? {
				make: form.make,
				model: form.model,
				year: form.year,
				mileageKm: form.mileageKm,
				fuelType: form.fuelType || null,
				transmission: form.transmission || null,
				color: form.color || null
			} : {},
			...form.category === "service" ? {
				serviceRadiusKm: form.serviceRadiusKm,
				experienceYears: form.experienceYears,
				responseTime: form.responseTime || null
			} : {},
			assets: form.imageUrls.map((url, i) => ({
				kind: "image",
				url,
				altText: null,
				sortOrder: i,
				isCover: i === form.coverIndex
			}))
		} }),
		onSuccess: () => navigate({ to: "/admin/listings" })
	});
	const update = (partial) => setForm((f) => ({
		...f,
		...partial
	}));
	const subCategories = form.category === "property" ? PROPERTY_SUBCATEGORIES : form.category === "vehicle" ? VEHICLE_SUBCATEGORIES : SERVICE_SUBCATEGORIES;
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-3xl space-y-6 p-6 lg:p-8",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold",
					children: t("admin.newListing", "New Listing")
				}), /* @__PURE__ */ jsxs(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => mutation.mutate("draft"),
					disabled: mutation.isPending || !form.titleEn,
					children: [/* @__PURE__ */ jsx(Save, { className: "mr-2 h-4 w-4" }), t("admin.saveDraft", "Save Draft")]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-1",
				children: STEPS.map((label, i) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ jsx("button", {
							onClick: () => setStep(i),
							className: `flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary/20 text-primary ring-2 ring-primary" : "bg-muted text-muted-foreground"}`,
							children: i < step ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : i + 1
						}),
						/* @__PURE__ */ jsx("span", {
							className: "hidden text-xs text-muted-foreground sm:inline",
							children: label
						}),
						i < STEPS.length - 1 && /* @__PURE__ */ jsx("div", { className: "mx-1 h-px w-4 bg-border sm:w-8" })
					]
				}, label))
			}),
			/* @__PURE__ */ jsx(AnimatePresence, {
				mode: "wait",
				children: /* @__PURE__ */ jsx(m.div, {
					initial: {
						opacity: 0,
						x: 20
					},
					animate: {
						opacity: 1,
						x: 0
					},
					exit: {
						opacity: 0,
						x: -20
					},
					transition: { duration: .2 },
					children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, {
						className: "space-y-4 p-6",
						children: [
							step === 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx(CardHeader, {
									className: "p-0 pb-4",
									children: /* @__PURE__ */ jsx(CardTitle, { children: "Category & Type" })
								}),
								/* @__PURE__ */ jsx("div", {
									className: "grid grid-cols-3 gap-3",
									children: [
										"property",
										"vehicle",
										"service"
									].map((cat) => /* @__PURE__ */ jsx("button", {
										onClick: () => update({
											category: cat,
											subCategory: ""
										}),
										className: `rounded-lg border-2 p-4 text-center capitalize transition ${form.category === cat ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`,
										children: cat
									}, cat))
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium",
									children: "Sub-category"
								}), /* @__PURE__ */ jsxs(Select, {
									value: form.subCategory,
									onValueChange: (v) => update({ subCategory: v }),
									children: [/* @__PURE__ */ jsx(SelectTrigger, {
										className: "mt-1",
										children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select..." })
									}), /* @__PURE__ */ jsx(SelectContent, { children: subCategories.map((sc) => /* @__PURE__ */ jsx(SelectItem, {
										value: sc,
										children: sc.replace(/_/g, " ")
									}, sc)) })]
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium",
									children: "Transaction type"
								}), /* @__PURE__ */ jsx("div", {
									className: "mt-1 flex gap-2",
									children: [
										"buy",
										"rent",
										"hire"
									].map((tt) => /* @__PURE__ */ jsx("button", {
										onClick: () => update({ transactionType: tt }),
										className: `rounded-md border px-4 py-2 text-sm capitalize transition ${form.transactionType === tt ? "border-primary bg-primary/10" : "border-border"}`,
										children: tt
									}, tt))
								})] })
							] }),
							step === 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx(CardHeader, {
									className: "p-0 pb-4",
									children: /* @__PURE__ */ jsx(CardTitle, { children: "Basic Details" })
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium",
									children: "Title (English) *"
								}), /* @__PURE__ */ jsx(Input, {
									value: form.titleEn,
									onChange: (e) => update({ titleEn: e.target.value }),
									className: "mt-1"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium",
									children: "Title (Español)"
								}), /* @__PURE__ */ jsx(Input, {
									value: form.titleEs,
									onChange: (e) => update({ titleEs: e.target.value }),
									className: "mt-1"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium",
									children: "Summary"
								}), /* @__PURE__ */ jsx(Input, {
									value: form.summaryEn,
									onChange: (e) => update({ summaryEn: e.target.value }),
									className: "mt-1"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium",
									children: "Description (English)"
								}), /* @__PURE__ */ jsx("textarea", {
									value: form.descriptionEn,
									onChange: (e) => update({ descriptionEn: e.target.value }),
									rows: 4,
									className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium",
									children: "Description (Español)"
								}), /* @__PURE__ */ jsx("textarea", {
									value: form.descriptionEs,
									onChange: (e) => update({ descriptionEs: e.target.value }),
									rows: 4,
									className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								})] }),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-3 gap-3",
									children: [
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Price *"
										}), /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: form.price || "",
											onChange: (e) => update({ price: Number(e.target.value) }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Currency"
										}), /* @__PURE__ */ jsxs(Select, {
											value: form.currency,
											onValueChange: (v) => update({ currency: v }),
											children: [/* @__PURE__ */ jsx(SelectTrigger, {
												className: "mt-1",
												children: /* @__PURE__ */ jsx(SelectValue, {})
											}), /* @__PURE__ */ jsxs(SelectContent, { children: [
												/* @__PURE__ */ jsx(SelectItem, {
													value: "DKK",
													children: "DKK"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "EUR",
													children: "EUR"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "USD",
													children: "USD"
												})
											] })]
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Period"
										}), /* @__PURE__ */ jsxs(Select, {
											value: form.pricePeriod ?? "one_time",
											onValueChange: (v) => update({ pricePeriod: v }),
											children: [/* @__PURE__ */ jsx(SelectTrigger, {
												className: "mt-1",
												children: /* @__PURE__ */ jsx(SelectValue, {})
											}), /* @__PURE__ */ jsxs(SelectContent, { children: [
												/* @__PURE__ */ jsx(SelectItem, {
													value: "one_time",
													children: "One-time"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "monthly",
													children: "Monthly"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "daily",
													children: "Daily"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "hourly",
													children: "Hourly"
												})
											] })]
										})] })
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("input", {
										type: "checkbox",
										checked: form.featured,
										onChange: (e) => update({ featured: e.target.checked }),
										className: "h-4 w-4"
									}), /* @__PURE__ */ jsx("label", {
										className: "text-sm",
										children: "Featured listing"
									})]
								})
							] }),
							step === 2 && /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx(CardHeader, {
									className: "p-0 pb-4",
									children: /* @__PURE__ */ jsx(CardTitle, { children: form.category === "property" ? "Property Details" : form.category === "vehicle" ? "Vehicle Details" : "Service Details" })
								}),
								form.category === "property" && /* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-4",
									children: [
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Bedrooms"
										}), /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: form.bedrooms ?? "",
											onChange: (e) => update({ bedrooms: e.target.value ? Number(e.target.value) : null }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Bathrooms"
										}), /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: form.bathrooms ?? "",
											onChange: (e) => update({ bathrooms: e.target.value ? Number(e.target.value) : null }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Area (m²)"
										}), /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: form.areaSqm ?? "",
											onChange: (e) => update({ areaSqm: e.target.value ? Number(e.target.value) : null }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Year Built"
										}), /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: form.yearBuilt ?? "",
											onChange: (e) => update({ yearBuilt: e.target.value ? Number(e.target.value) : null }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Parking Spaces"
										}), /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: form.parkingSpaces ?? "",
											onChange: (e) => update({ parkingSpaces: e.target.value ? Number(e.target.value) : null }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2 self-end pb-2",
											children: [/* @__PURE__ */ jsx("input", {
												type: "checkbox",
												checked: form.furnished,
												onChange: (e) => update({ furnished: e.target.checked }),
												className: "h-4 w-4"
											}), /* @__PURE__ */ jsx("label", {
												className: "text-sm",
												children: "Furnished"
											})]
										})
									]
								}),
								form.category === "vehicle" && /* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-4",
									children: [
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Make *"
										}), /* @__PURE__ */ jsx(Input, {
											value: form.make,
											onChange: (e) => update({ make: e.target.value }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Model *"
										}), /* @__PURE__ */ jsx(Input, {
											value: form.model,
											onChange: (e) => update({ model: e.target.value }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Year *"
										}), /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: form.year,
											onChange: (e) => update({ year: Number(e.target.value) }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Mileage (km)"
										}), /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: form.mileageKm ?? "",
											onChange: (e) => update({ mileageKm: e.target.value ? Number(e.target.value) : null }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Fuel Type"
										}), /* @__PURE__ */ jsxs(Select, {
											value: form.fuelType,
											onValueChange: (v) => update({ fuelType: v }),
											children: [/* @__PURE__ */ jsx(SelectTrigger, {
												className: "mt-1",
												children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select..." })
											}), /* @__PURE__ */ jsxs(SelectContent, { children: [
												/* @__PURE__ */ jsx(SelectItem, {
													value: "gasoline",
													children: "Gasoline"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "diesel",
													children: "Diesel"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "electric",
													children: "Electric"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "hybrid",
													children: "Hybrid"
												})
											] })]
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Transmission"
										}), /* @__PURE__ */ jsxs(Select, {
											value: form.transmission,
											onValueChange: (v) => update({ transmission: v }),
											children: [/* @__PURE__ */ jsx(SelectTrigger, {
												className: "mt-1",
												children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select..." })
											}), /* @__PURE__ */ jsxs(SelectContent, { children: [/* @__PURE__ */ jsx(SelectItem, {
												value: "manual",
												children: "Manual"
											}), /* @__PURE__ */ jsx(SelectItem, {
												value: "automatic",
												children: "Automatic"
											})] })]
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Color"
										}), /* @__PURE__ */ jsx(Input, {
											value: form.color,
											onChange: (e) => update({ color: e.target.value }),
											className: "mt-1"
										})] })
									]
								}),
								form.category === "service" && /* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-4",
									children: [
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Service Radius (km)"
										}), /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: form.serviceRadiusKm ?? "",
											onChange: (e) => update({ serviceRadiusKm: e.target.value ? Number(e.target.value) : null }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Experience (years)"
										}), /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: form.experienceYears ?? "",
											onChange: (e) => update({ experienceYears: e.target.value ? Number(e.target.value) : null }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Response Time"
										}), /* @__PURE__ */ jsx(Input, {
											value: form.responseTime,
											onChange: (e) => update({ responseTime: e.target.value }),
											placeholder: "e.g. Same day",
											className: "mt-1"
										})] })
									]
								})
							] }),
							step === 3 && /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx(CardHeader, {
									className: "p-0 pb-4",
									children: /* @__PURE__ */ jsx(CardTitle, { children: "Location" })
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium",
									children: "Address *"
								}), /* @__PURE__ */ jsx(Input, {
									value: form.addressLine1,
									onChange: (e) => update({ addressLine1: e.target.value }),
									className: "mt-1"
								})] }),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-3 gap-3",
									children: [
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "City *"
										}), /* @__PURE__ */ jsx(Input, {
											value: form.city,
											onChange: (e) => update({ city: e.target.value }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Region"
										}), /* @__PURE__ */ jsx(Input, {
											value: form.region,
											onChange: (e) => update({ region: e.target.value }),
											className: "mt-1"
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium",
											children: "Country"
										}), /* @__PURE__ */ jsx(Input, {
											value: form.country,
											onChange: (e) => update({ country: e.target.value }),
											className: "mt-1"
										})] })
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										className: "text-sm font-medium",
										children: "Latitude"
									}), /* @__PURE__ */ jsx(Input, {
										type: "number",
										step: "any",
										value: form.latitude,
										onChange: (e) => update({ latitude: Number(e.target.value) }),
										className: "mt-1"
									})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										className: "text-sm font-medium",
										children: "Longitude"
									}), /* @__PURE__ */ jsx(Input, {
										type: "number",
										step: "any",
										value: form.longitude,
										onChange: (e) => update({ longitude: Number(e.target.value) }),
										className: "mt-1"
									})] })]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-muted-foreground",
									children: "Default: Copenhagen center (55.6761, 12.5683)"
								})
							] }),
							step === 4 && /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx(CardHeader, {
									className: "p-0 pb-4",
									children: /* @__PURE__ */ jsx(CardTitle, { children: "Images" })
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ jsx(Input, {
										placeholder: "Paste image URL...",
										value: newImageUrl,
										onChange: (e) => setNewImageUrl(e.target.value),
										className: "flex-1"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "outline",
										onClick: () => {
											if (newImageUrl.trim()) {
												update({ imageUrls: [...form.imageUrls, newImageUrl.trim()] });
												setNewImageUrl("");
											}
										},
										children: "Add"
									})]
								}),
								form.imageUrls.length > 0 && /* @__PURE__ */ jsx("div", {
									className: "grid grid-cols-3 gap-3",
									children: form.imageUrls.map((url, i) => /* @__PURE__ */ jsxs("div", {
										className: "group relative",
										children: [/* @__PURE__ */ jsx("img", {
											src: url ?? "/img-placeholder.svg",
											alt: "",
											className: "h-24 w-full rounded-md object-cover",
											onError: (e) => {
												e.currentTarget.src = "/img-placeholder.svg";
												e.currentTarget.onerror = null;
											}
										}), /* @__PURE__ */ jsxs("div", {
											className: "absolute inset-0 flex items-center justify-center gap-1 rounded-md bg-black/50 opacity-0 transition group-hover:opacity-100",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => update({ coverIndex: i }),
												className: `rounded px-2 py-1 text-xs ${i === form.coverIndex ? "bg-primary text-white" : "bg-white/80 text-black"}`,
												children: i === form.coverIndex ? "Cover ✓" : "Set Cover"
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => {
													const urls = form.imageUrls.filter((_, j) => j !== i);
													update({
														imageUrls: urls,
														coverIndex: Math.min(form.coverIndex, urls.length - 1)
													});
												},
												className: "rounded bg-red-500 px-2 py-1 text-xs text-white",
												children: "Remove"
											})]
										})]
									}, i))
								}),
								form.imageUrls.length === 0 && /* @__PURE__ */ jsx("p", {
									className: "text-sm text-muted-foreground",
									children: "No images added yet"
								})
							] }),
							step === 5 && /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsx(CardHeader, {
									className: "p-0 pb-4",
									children: /* @__PURE__ */ jsx(CardTitle, { children: "Review & Publish" })
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-3 text-sm",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex gap-2",
											children: [
												/* @__PURE__ */ jsx(Badge, { children: form.category }),
												/* @__PURE__ */ jsx(Badge, {
													variant: "outline",
													children: form.subCategory || "No sub-category"
												}),
												/* @__PURE__ */ jsx(Badge, {
													variant: "secondary",
													children: form.transactionType
												})
											]
										}),
										/* @__PURE__ */ jsx(Separator, {}),
										/* @__PURE__ */ jsxs("div", { children: [
											/* @__PURE__ */ jsx("strong", { children: "Title:" }),
											" ",
											form.titleEn || "(empty)"
										] }),
										/* @__PURE__ */ jsxs("div", { children: [
											/* @__PURE__ */ jsx("strong", { children: "Price:" }),
											" ",
											form.price,
											" ",
											form.currency
										] }),
										/* @__PURE__ */ jsxs("div", { children: [
											/* @__PURE__ */ jsx("strong", { children: "Location:" }),
											" ",
											form.addressLine1,
											", ",
											form.city,
											", ",
											form.country
										] }),
										/* @__PURE__ */ jsxs("div", { children: [
											/* @__PURE__ */ jsx("strong", { children: "Coordinates:" }),
											" ",
											form.latitude,
											", ",
											form.longitude
										] }),
										/* @__PURE__ */ jsxs("div", { children: [
											/* @__PURE__ */ jsx("strong", { children: "Images:" }),
											" ",
											form.imageUrls.length
										] }),
										form.category === "property" && /* @__PURE__ */ jsxs("div", { children: [
											/* @__PURE__ */ jsx("strong", { children: "Property:" }),
											" ",
											form.bedrooms,
											" beds, ",
											form.bathrooms,
											" baths, ",
											form.areaSqm,
											"m²"
										] }),
										form.category === "vehicle" && /* @__PURE__ */ jsxs("div", { children: [
											/* @__PURE__ */ jsx("strong", { children: "Vehicle:" }),
											" ",
											form.make,
											" ",
											form.model,
											" ",
											form.year
										] }),
										form.category === "service" && /* @__PURE__ */ jsxs("div", { children: [
											/* @__PURE__ */ jsx("strong", { children: "Service:" }),
											" ",
											form.experienceYears,
											" yrs exp, ",
											form.serviceRadiusKm,
											"km radius"
										] })
									]
								}),
								/* @__PURE__ */ jsx(Separator, {}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ jsxs(Button, {
										variant: "outline",
										className: "flex-1",
										onClick: () => mutation.mutate("draft"),
										disabled: mutation.isPending || !form.titleEn,
										children: [mutation.isPending && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Save as Draft"]
									}), /* @__PURE__ */ jsxs(Button, {
										className: "flex-1",
										onClick: () => mutation.mutate("published"),
										disabled: mutation.isPending || !form.titleEn,
										children: [mutation.isPending && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Publish"]
									})]
								})
							] })
						]
					}) })
				}, step)
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex justify-between",
				children: [/* @__PURE__ */ jsxs(Button, {
					variant: "outline",
					onClick: () => setStep((s) => s - 1),
					disabled: step === 0,
					children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "mr-1 h-4 w-4" }), " Previous"]
				}), step < STEPS.length - 1 && /* @__PURE__ */ jsxs(Button, {
					onClick: () => setStep((s) => s + 1),
					children: ["Next ", /* @__PURE__ */ jsx(ChevronRight, { className: "ml-1 h-4 w-4" })]
				})]
			})
		]
	});
}
//#endregion
export { ListingFormPage as t };
