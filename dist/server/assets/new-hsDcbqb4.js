import { t as createListingFn } from "./listings-mutations.fn-_qQxbbbG.js";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation } from "@tanstack/react-query";
//#region src/routes/_account/account/listings/new.tsx?tsr-split=component
function NewListingPage() {
	const router = useRouter();
	const [category, setCategory] = useState("property");
	const [transactionType, setTxn] = useState("rent");
	const [error, setError] = useState(null);
	const create = useMutation({
		mutationFn: (data) => createListingFn({ data }),
		onSuccess: (res) => {
			router.navigate({
				to: "/account/listings/$id",
				params: { id: res.id }
			});
		},
		onError: (err) => setError(err.message ?? "Failed to create listing")
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		setError(null);
		const fd = new FormData(e.currentTarget);
		const num = (k) => {
			const v = fd.get(k);
			const n = typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
			return Number.isFinite(n) ? n : void 0;
		};
		const str = (k) => {
			const v = fd.get(k);
			return typeof v === "string" && v.trim() !== "" ? v.trim() : void 0;
		};
		const imageUrls = (fd.get("imageUrls") ?? "").split(/\n+/).map((s) => s.trim()).filter(Boolean);
		const subCategory = str("subCategory") ?? defaultSubCategory(category);
		const property = category === "property" ? {
			bedrooms: num("bedrooms"),
			bathrooms: num("bathrooms"),
			areaSqm: num("areaSqm"),
			yearBuilt: num("yearBuilt")
		} : void 0;
		const vehicle = category === "vehicle" ? {
			make: str("make") ?? "",
			model: str("model") ?? "",
			year: num("year") ?? (/* @__PURE__ */ new Date()).getFullYear(),
			mileageKm: num("mileageKm")
		} : void 0;
		const service = category === "service" ? {
			serviceRadiusKm: num("serviceRadiusKm"),
			experienceYears: num("experienceYears")
		} : void 0;
		const experience = category === "experience" ? {
			durationHours: num("durationHours"),
			maxGuests: num("maxGuests")
		} : void 0;
		create.mutate({
			category,
			subCategory,
			transactionType,
			title: str("title") ?? "",
			description: str("description"),
			price: num("price") ?? 0,
			currency: (str("currency") ?? "DKK").toUpperCase(),
			pricePeriod: str("pricePeriod") ?? void 0,
			latitude: num("latitude") ?? 55.6761,
			longitude: num("longitude") ?? 12.5683,
			addressLine1: str("addressLine1") ?? "",
			city: str("city") ?? "",
			region: str("region"),
			country: (str("country") ?? "DK").toUpperCase(),
			contactMethod: str("contactMethod") ?? "in_app",
			contactEmail: str("contactEmail"),
			contactPhone: str("contactPhone"),
			contactUrl: str("contactUrl"),
			imageUrls,
			property,
			vehicle,
			service,
			experience
		});
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: "space-y-8",
		children: [
			/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-semibold",
				children: "Create a new listing"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-neutral-500",
				children: "It will be saved as a draft. You can publish it from your dashboard."
			})] }),
			/* @__PURE__ */ jsxs(Section, {
				title: "What are you posting?",
				children: [
					/* @__PURE__ */ jsx(Field, {
						label: "Category",
						children: /* @__PURE__ */ jsxs(Select, {
							value: category,
							onChange: (v) => setCategory(v),
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "property",
									children: "Property"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "vehicle",
									children: "Vehicle"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "service",
									children: "Service"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "experience",
									children: "Experience"
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Transaction type",
						children: /* @__PURE__ */ jsxs(Select, {
							value: transactionType,
							onChange: (v) => setTxn(v),
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "rent",
									children: "Rent"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "buy",
									children: "Buy / Sell"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "hire",
									children: "Hire / Book"
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Sub-category",
						children: /* @__PURE__ */ jsx(Input, {
							name: "subCategory",
							defaultValue: defaultSubCategory(category),
							placeholder: "apartment, sedan, plumber…"
						})
					})
				]
			}),
			/* @__PURE__ */ jsxs(Section, {
				title: "Basics",
				children: [
					/* @__PURE__ */ jsx(Field, {
						label: "Title (required)",
						children: /* @__PURE__ */ jsx(Input, {
							name: "title",
							required: true,
							minLength: 3,
							maxLength: 200
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Description",
						children: /* @__PURE__ */ jsx(Textarea, {
							name: "description",
							rows: 4,
							maxLength: 8e3
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Price (in minor units, e.g. 1500000 = 15,000.00 DKK)",
						children: /* @__PURE__ */ jsx(Input, {
							name: "price",
							type: "number",
							min: 0,
							required: true
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Currency",
						children: /* @__PURE__ */ jsx(Input, {
							name: "currency",
							defaultValue: "DKK",
							maxLength: 3
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Price period (optional)",
						children: /* @__PURE__ */ jsxs(Select, {
							name: "pricePeriod",
							defaultValue: "",
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "",
									children: "—"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "one_time",
									children: "One-time"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "monthly",
									children: "Monthly"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "daily",
									children: "Daily"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "hourly",
									children: "Hourly"
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ jsxs(Section, {
				title: "Location",
				children: [
					/* @__PURE__ */ jsx(Field, {
						label: "Address line 1",
						children: /* @__PURE__ */ jsx(Input, {
							name: "addressLine1",
							required: true,
							maxLength: 500
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "City",
						children: /* @__PURE__ */ jsx(Input, {
							name: "city",
							required: true,
							maxLength: 255
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Region (optional)",
						children: /* @__PURE__ */ jsx(Input, {
							name: "region",
							maxLength: 255
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Country (ISO-2)",
						children: /* @__PURE__ */ jsx(Input, {
							name: "country",
							defaultValue: "DK",
							maxLength: 2
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsx(Field, {
							label: "Latitude",
							children: /* @__PURE__ */ jsx(Input, {
								name: "latitude",
								type: "number",
								step: "any",
								defaultValue: 55.6761,
								required: true
							})
						}), /* @__PURE__ */ jsx(Field, {
							label: "Longitude",
							children: /* @__PURE__ */ jsx(Input, {
								name: "longitude",
								type: "number",
								step: "any",
								defaultValue: 12.5683,
								required: true
							})
						})]
					})
				]
			}),
			category === "property" && /* @__PURE__ */ jsx(Section, {
				title: "Property details",
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 gap-3",
					children: [
						/* @__PURE__ */ jsx(Field, {
							label: "Bedrooms",
							children: /* @__PURE__ */ jsx(Input, {
								name: "bedrooms",
								type: "number",
								min: 0,
								max: 50
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Bathrooms",
							children: /* @__PURE__ */ jsx(Input, {
								name: "bathrooms",
								type: "number",
								min: 0,
								max: 50
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Area (m²)",
							children: /* @__PURE__ */ jsx(Input, {
								name: "areaSqm",
								type: "number",
								min: 0,
								max: 1e5
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Year built",
							children: /* @__PURE__ */ jsx(Input, {
								name: "yearBuilt",
								type: "number",
								min: 1500,
								max: 2100
							})
						})
					]
				})
			}),
			category === "vehicle" && /* @__PURE__ */ jsxs(Section, {
				title: "Vehicle details",
				children: [
					/* @__PURE__ */ jsx(Field, {
						label: "Make",
						children: /* @__PURE__ */ jsx(Input, {
							name: "make",
							required: true,
							maxLength: 100
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Model",
						children: /* @__PURE__ */ jsx(Input, {
							name: "model",
							required: true,
							maxLength: 100
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Year",
						children: /* @__PURE__ */ jsx(Input, {
							name: "year",
							type: "number",
							min: 1900,
							max: 2100,
							required: true
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Mileage (km)",
						children: /* @__PURE__ */ jsx(Input, {
							name: "mileageKm",
							type: "number",
							min: 0
						})
					})
				]
			}),
			category === "service" && /* @__PURE__ */ jsxs(Section, {
				title: "Service details",
				children: [/* @__PURE__ */ jsx(Field, {
					label: "Service radius (km)",
					children: /* @__PURE__ */ jsx(Input, {
						name: "serviceRadiusKm",
						type: "number",
						min: 0
					})
				}), /* @__PURE__ */ jsx(Field, {
					label: "Years of experience",
					children: /* @__PURE__ */ jsx(Input, {
						name: "experienceYears",
						type: "number",
						min: 0
					})
				})]
			}),
			category === "experience" && /* @__PURE__ */ jsxs(Section, {
				title: "Experience details",
				children: [/* @__PURE__ */ jsx(Field, {
					label: "Duration (hours)",
					children: /* @__PURE__ */ jsx(Input, {
						name: "durationHours",
						type: "number",
						min: 0,
						step: "any"
					})
				}), /* @__PURE__ */ jsx(Field, {
					label: "Max guests",
					children: /* @__PURE__ */ jsx(Input, {
						name: "maxGuests",
						type: "number",
						min: 1
					})
				})]
			}),
			/* @__PURE__ */ jsx(Section, {
				title: "Photos",
				children: /* @__PURE__ */ jsx(Field, {
					label: "Image URLs (one per line, up to 20)",
					children: /* @__PURE__ */ jsx(Textarea, {
						name: "imageUrls",
						rows: 4,
						placeholder: "https://…"
					})
				})
			}),
			/* @__PURE__ */ jsxs(Section, {
				title: "Contact preferences",
				children: [
					/* @__PURE__ */ jsx(Field, {
						label: "Method",
						children: /* @__PURE__ */ jsxs(Select, {
							name: "contactMethod",
							defaultValue: "in_app",
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "in_app",
									children: "In-app messaging (recommended)"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "email",
									children: "Email"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "phone",
									children: "Phone"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "external_url",
									children: "External URL"
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Contact email",
						children: /* @__PURE__ */ jsx(Input, {
							name: "contactEmail",
							type: "email"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Contact phone",
						children: /* @__PURE__ */ jsx(Input, { name: "contactPhone" })
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Contact URL",
						children: /* @__PURE__ */ jsx(Input, {
							name: "contactUrl",
							type: "url"
						})
					})
				]
			}),
			error && /* @__PURE__ */ jsx("p", {
				className: "text-sm text-red-600",
				children: error
			}),
			/* @__PURE__ */ jsx("footer", {
				className: "flex items-center justify-end gap-3 border-t pt-6 dark:border-neutral-800",
				children: /* @__PURE__ */ jsx("button", {
					type: "submit",
					disabled: create.isPending,
					className: "rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900",
					children: create.isPending ? "Creating…" : "Save as draft"
				})
			})
		]
	});
}
function defaultSubCategory(c) {
	return c === "property" ? "apartment" : c === "vehicle" ? "sedan" : c === "service" ? "general" : "tour";
}
function Section({ title, children }) {
	return /* @__PURE__ */ jsxs("fieldset", {
		className: "rounded-lg border bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900",
		children: [/* @__PURE__ */ jsx("legend", {
			className: "px-2 text-sm font-medium",
			children: title
		}), /* @__PURE__ */ jsx("div", {
			className: "space-y-3",
			children
		})]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "block",
		children: [/* @__PURE__ */ jsx("span", {
			className: "mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400",
			children: label
		}), children]
	});
}
var inputCls = "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";
function Input(props) {
	return /* @__PURE__ */ jsx("input", {
		...props,
		className: inputCls
	});
}
function Textarea(props) {
	return /* @__PURE__ */ jsx("textarea", {
		...props,
		className: inputCls
	});
}
function Select({ value, onChange, children, ...rest }) {
	return /* @__PURE__ */ jsx("select", {
		...rest,
		value,
		onChange: (e) => onChange?.(e.currentTarget.value),
		className: inputCls,
		children
	});
}
//#endregion
export { NewListingPage as component };
