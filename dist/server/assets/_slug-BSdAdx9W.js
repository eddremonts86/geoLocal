import { t as cn } from "./utils-C98NY0TH.js";
import { t as Route } from "./_slug-D7iHGJjY.js";
import { t as Button } from "./button-DX0eJ04i.js";
import { t as Skeleton } from "./skeleton-ePPLs61V.js";
import { t as Input } from "./input-DIdDhyf2.js";
import { t as Separator$1 } from "./separator-C7fmWKHk.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, t as Dialog$1 } from "./dialog-IiWaMIzz.js";
import { i as formatListingPrice, n as CATEGORY_ICONS, r as EDITORIAL_EASE } from "./display-wPMPnOaq.js";
import { n as listingDetailQueryOptions } from "./queries-C9jbt2hB.js";
import { t as Toggle$1 } from "./toggle-BofjlVnc.js";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Label } from "radix-ui";
import { ArrowLeft, Award, Bath, Bed, Calendar, CheckCircle2, Clock, Fuel, Gauge, Heart, Home, MapPin, Maximize, Share2 } from "lucide-react";
//#region src/components/ui/textarea.tsx
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ jsx("textarea", {
		"data-slot": "textarea",
		className: cn("min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", className),
		...props
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Label$1({ className, ...props }) {
	return /* @__PURE__ */ jsx(Label.Root, {
		"data-slot": "label",
		className: cn("text-sm font-medium leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
		...props
	});
}
//#endregion
//#region src/modules/listings/ui/ListingDetailPage.tsx
function ListingDetailPage({ slug }) {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { data: listing, isLoading, isError } = useQuery(listingDetailQueryOptions(slug, i18n.language));
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [contactOpen, setContactOpen] = useState(false);
	const [bookingOpen, setBookingOpen] = useState(false);
	if (isLoading) return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-5xl space-y-6 p-4 pt-8",
		children: [
			/* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-48" }),
			/* @__PURE__ */ jsx(Skeleton, { className: "h-80 w-full rounded-xl" }),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-4 lg:col-span-2",
					children: [/* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-64" }), /* @__PURE__ */ jsx(Skeleton, { className: "h-32 w-full" })]
				}), /* @__PURE__ */ jsx(Skeleton, { className: "h-48 w-full rounded-xl" })]
			})
		]
	});
	if (isError || !listing) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center gap-4 p-16 text-center",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-lg text-muted-foreground",
			children: t("listing.notFound", "Listing not found")
		}), /* @__PURE__ */ jsx(Button, {
			variant: "outline",
			onClick: () => navigate({ to: "/explore" }),
			children: t("listing.backToExplore", "Back to explore")
		})]
	});
	const Icon = CATEGORY_ICONS[listing.category] ?? Home;
	const images = listing.assets?.filter((a) => a.kind === "image") ?? [];
	const currentImage = images[currentImageIndex];
	const { amount: formattedPrice, suffix: priceSuffix } = formatListingPrice(listing.price, listing.currency, listing.pricePeriod, i18n.language);
	return /* @__PURE__ */ jsxs(m.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		transition: { duration: .3 },
		className: "mx-auto max-w-[1400px] px-6 pb-32 pt-6 md:pb-24 md:px-10",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-10 flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs(Button, {
					variant: "ghost",
					onClick: () => navigate({ to: "/explore" }),
					className: "group h-auto gap-2 rounded-none px-0 py-0 text-sm hover:bg-transparent hover:text-foreground",
					style: { color: "var(--ink-2)" },
					children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" }), /* @__PURE__ */ jsx("span", {
						className: "meta-label",
						children: t("listing.back", "Back")
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						className: "rounded-none",
						style: { color: "var(--ink-3)" },
						"aria-label": "Share",
						children: /* @__PURE__ */ jsx(Share2, {
							className: "h-4 w-4",
							strokeWidth: 1.5
						})
					}), /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						className: "rounded-none hover:text-(--red)",
						style: { color: "var(--ink-3)" },
						"aria-label": "Favorite",
						children: /* @__PURE__ */ jsx(Heart, {
							className: "h-4 w-4",
							strokeWidth: 1.5
						})
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("header", {
				className: "mb-10 grid grid-cols-12 gap-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "col-span-12 md:col-span-9",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-5 flex flex-wrap items-center gap-x-3 gap-y-1",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "meta-label",
									style: { color: "var(--amber-ink)" },
									children: listing.transactionType
								}),
								/* @__PURE__ */ jsx("span", {
									style: { color: "var(--ink-4)" },
									children: "·"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "meta-label",
									style: { color: "var(--ink-3)" },
									children: listing.category
								}),
								/* @__PURE__ */ jsx("span", {
									style: { color: "var(--ink-4)" },
									children: "·"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "meta-label",
									style: { color: "var(--ink-3)" },
									children: listing.subCategory
								})
							]
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "font-display text-[clamp(2.5rem,1.8rem+3.5vw,5rem)] font-medium leading-[0.98] tracking-[-0.025em] text-foreground",
							children: listing.title
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-5 flex items-center gap-1.5 text-sm",
							style: { color: "var(--ink-2)" },
							children: [
								/* @__PURE__ */ jsx(MapPin, {
									className: "h-3.5 w-3.5",
									strokeWidth: 1.5
								}),
								listing.addressLine1,
								", ",
								listing.city,
								", ",
								listing.country
							]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "col-span-12 flex items-end justify-start md:col-span-3 md:justify-end",
					children: /* @__PURE__ */ jsxs("div", {
						className: "text-left md:text-right",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "meta-label mb-1",
								style: { color: "var(--ink-3)" },
								children: t("editorial.price", "Price")
							}),
							/* @__PURE__ */ jsx("p", {
								className: "font-display text-3xl font-medium tabular-nums tracking-[-0.015em] text-foreground md:text-4xl",
								children: formattedPrice
							}),
							priceSuffix && /* @__PURE__ */ jsx("p", {
								className: "text-xs tabular-nums",
								style: { color: "var(--ink-3)" },
								children: priceSuffix
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ jsx(Separator$1, {}),
			images.length > 0 && /* @__PURE__ */ jsxs(m.div, {
				initial: {
					opacity: 0,
					y: 16
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .5,
					delay: .08,
					ease: EDITORIAL_EASE
				},
				className: "my-10 md:my-14",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "relative aspect-[16/9] max-h-[560px] overflow-hidden bg-[var(--surface-2)]",
					children: [/* @__PURE__ */ jsx("img", {
						src: currentImage?.url ?? "/img-placeholder.svg",
						alt: currentImage?.altText ?? listing.title,
						className: "h-full w-full object-cover",
						onError: (e) => {
							e.currentTarget.src = "/img-placeholder.svg";
							e.currentTarget.onerror = null;
						}
					}), images.length > 1 && /* @__PURE__ */ jsxs("div", {
						className: "absolute bottom-4 right-4 font-mono text-xs tabular-nums",
						style: { color: "oklch(1 0 0 / 0.9)" },
						children: [
							String(currentImageIndex + 1).padStart(2, "0"),
							" / ",
							String(images.length).padStart(2, "0")
						]
					})]
				}), images.length > 1 && /* @__PURE__ */ jsx("div", {
					className: "mt-3 flex gap-2 overflow-x-auto pb-1",
					children: images.map((img, i) => /* @__PURE__ */ jsx("button", {
						onClick: () => setCurrentImageIndex(i),
						className: `h-16 w-24 shrink-0 overflow-hidden transition-opacity ${i === currentImageIndex ? "opacity-100 ring-2 ring-[var(--amber)] ring-offset-2 ring-offset-background" : "opacity-60 hover:opacity-100"}`,
						children: /* @__PURE__ */ jsx("img", {
							src: img.url ?? "/img-placeholder.svg",
							alt: "",
							className: "h-full w-full object-cover",
							loading: "lazy",
							onError: (e) => {
								e.currentTarget.src = "/img-placeholder.svg";
								e.currentTarget.onerror = null;
							}
						})
					}, img.id))
				})]
			}),
			/* @__PURE__ */ jsx(Separator$1, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-10 grid grid-cols-12 gap-x-8 gap-y-10 md:mt-14",
				children: [/* @__PURE__ */ jsxs(m.div, {
					initial: {
						opacity: 0,
						y: 16
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .4,
						delay: .12
					},
					className: "col-span-12 space-y-10 md:col-span-7",
					children: [listing.description && /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("div", {
						className: "meta-label mb-4",
						children: ["01 / ", t("listing.description", "Description")]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-base leading-[1.7]",
						style: { color: "var(--ink-2)" },
						children: listing.description
					})] }), listing.features?.length > 0 && /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("div", {
						className: "meta-label mb-4",
						children: ["02 / ", t("listing.features", "Features")]
					}), /* @__PURE__ */ jsx("ul", {
						className: "grid grid-cols-2 gap-x-6 gap-y-2 text-sm",
						children: listing.features.map((f) => /* @__PURE__ */ jsxs("li", {
							className: "flex items-center gap-2 border-b py-2 capitalize",
							style: {
								borderColor: "var(--line-1)",
								color: "var(--ink-1)"
							},
							children: [/* @__PURE__ */ jsx("span", {
								className: "h-1 w-1 rounded-full",
								style: { backgroundColor: "var(--amber)" }
							}), f.replace(/_/g, " ")]
						}, f))
					})] })]
				}), /* @__PURE__ */ jsx(m.aside, {
					initial: {
						opacity: 0,
						y: 16
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .4,
						delay: .18
					},
					className: "col-span-12 md:col-span-5",
					children: /* @__PURE__ */ jsxs("div", {
						className: "sticky top-24 space-y-8",
						children: [/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("div", {
							className: "meta-label mb-4",
							children: t("editorial.specification", "Specification")
						}), /* @__PURE__ */ jsxs("dl", {
							className: "divide-y",
							style: {
								borderTop: "1px solid var(--line-1)",
								borderBottom: "1px solid var(--line-1)"
							},
							children: [
								listing.category === "property" && /* @__PURE__ */ jsxs(Fragment, { children: [
									listing.bedrooms != null && /* @__PURE__ */ jsx(SpecRow, {
										icon: Bed,
										label: t("property.beds", "Beds"),
										value: listing.bedrooms
									}),
									listing.bathrooms != null && /* @__PURE__ */ jsx(SpecRow, {
										icon: Bath,
										label: t("property.baths", "Baths"),
										value: listing.bathrooms
									}),
									listing.areaSqm != null && /* @__PURE__ */ jsx(SpecRow, {
										icon: Maximize,
										label: "Area",
										value: `${listing.areaSqm} m²`
									}),
									listing.yearBuilt != null && /* @__PURE__ */ jsx(SpecRow, {
										icon: Calendar,
										label: "Year",
										value: listing.yearBuilt
									})
								] }),
								listing.category === "vehicle" && /* @__PURE__ */ jsxs(Fragment, { children: [
									listing.year != null && /* @__PURE__ */ jsx(SpecRow, {
										icon: Calendar,
										label: "Year",
										value: listing.year
									}),
									listing.mileageKm != null && /* @__PURE__ */ jsx(SpecRow, {
										icon: Gauge,
										label: "Mileage",
										value: `${listing.mileageKm.toLocaleString()} km`
									}),
									listing.fuelType && /* @__PURE__ */ jsx(SpecRow, {
										icon: Fuel,
										label: "Fuel",
										value: listing.fuelType
									}),
									listing.transmission && /* @__PURE__ */ jsx(SpecRow, {
										label: "Transmission",
										value: listing.transmission
									}),
									listing.color && /* @__PURE__ */ jsx(SpecRow, {
										label: "Color",
										value: listing.color
									})
								] }),
								listing.category === "service" && /* @__PURE__ */ jsxs(Fragment, { children: [
									listing.experienceYears != null && /* @__PURE__ */ jsx(SpecRow, {
										icon: Award,
										label: "Experience",
										value: `${listing.experienceYears} years`
									}),
									listing.responseTime && /* @__PURE__ */ jsx(SpecRow, {
										icon: Clock,
										label: "Response",
										value: listing.responseTime
									}),
									listing.serviceRadiusKm != null && /* @__PURE__ */ jsx(SpecRow, {
										label: "Radius",
										value: `${listing.serviceRadiusKm} km`
									})
								] }),
								/* @__PURE__ */ jsx(SpecRow, {
									icon: Icon,
									label: "Category",
									value: String(listing.category)
								})
							]
						})] }), /* @__PURE__ */ jsxs("div", {
							className: "hidden space-y-2 md:block",
							children: [/* @__PURE__ */ jsx(Button, {
								onClick: () => setContactOpen(true),
								className: "h-auto w-full rounded-none bg-foreground px-6 py-4 text-sm font-medium text-background hover:bg-(--amber) hover:text-(--surface-0)",
								children: listing.category === "service" ? t("listing.requestService", "Request service") : t("listing.contact", "Contact seller")
							}), /* @__PURE__ */ jsx(Button, {
								variant: "outline",
								onClick: () => setBookingOpen(true),
								className: "h-auto w-full rounded-none px-6 py-4 text-sm font-medium hover:bg-(--surface-2)",
								children: t("listing.bookTour", "Book a tour")
							})]
						})]
					})
				})]
			}),
			/* @__PURE__ */ jsx(ContactDialog, {
				open: contactOpen,
				onOpenChange: setContactOpen,
				listingTitle: listing.title,
				isService: listing.category === "service"
			}),
			/* @__PURE__ */ jsx(BookingDialog, {
				open: bookingOpen,
				onOpenChange: setBookingOpen,
				listingTitle: listing.title
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-border bg-background/95 p-4 backdrop-blur-sm md:hidden",
				children: [/* @__PURE__ */ jsx(Button, {
					onClick: () => setContactOpen(true),
					className: "h-auto flex-1 rounded-none bg-foreground py-3.5 text-sm font-medium text-background active:opacity-80",
					children: listing.category === "service" ? t("listing.requestService", "Request service") : t("listing.contact", "Contact seller")
				}), /* @__PURE__ */ jsx(Button, {
					variant: "outline",
					onClick: () => setBookingOpen(true),
					className: "h-auto flex-1 rounded-none py-3.5 text-sm font-medium active:bg-(--surface-2)",
					children: t("listing.bookTour", "Book a tour")
				})]
			})
		]
	});
}
function SpecRow({ icon: RowIcon, label, value }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between gap-4 py-3 text-sm",
		style: { borderColor: "var(--line-1)" },
		children: [/* @__PURE__ */ jsxs("dt", {
			className: "flex items-center gap-2",
			style: { color: "var(--ink-3)" },
			children: [RowIcon && /* @__PURE__ */ jsx(RowIcon, {
				className: "h-3.5 w-3.5",
				strokeWidth: 1.5
			}), /* @__PURE__ */ jsx("span", {
				className: "meta-label",
				style: {
					color: "var(--ink-3)",
					fontSize: "0.6875rem"
				},
				children: label
			})]
		}), /* @__PURE__ */ jsx("dd", {
			className: "tabular-nums text-foreground",
			children: value
		})]
	});
}
function ContactDialog({ open, onOpenChange, listingTitle, isService }) {
	const { t } = useTranslation();
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		message: ""
	});
	const [submitted, setSubmitted] = useState(false);
	const handleSubmit = (e) => {
		e.preventDefault();
		setSubmitted(true);
	};
	const handleClose = (v) => {
		if (!v) {
			setForm({
				name: "",
				email: "",
				phone: "",
				message: ""
			});
			setSubmitted(false);
		}
		onOpenChange(v);
	};
	return /* @__PURE__ */ jsx(Dialog$1, {
		open,
		onOpenChange: handleClose,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, {
				className: "font-display text-xl font-medium",
				children: isService ? t("listing.requestService", "Request service") : t("listing.contact", "Contact seller")
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm",
				style: { color: "var(--ink-3)" },
				children: listingTitle
			})] }), submitted ? /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center gap-3 py-8 text-center",
				children: [
					/* @__PURE__ */ jsx(CheckCircle2, {
						className: "h-10 w-10",
						style: { color: "var(--amber)" },
						strokeWidth: 1.5
					}),
					/* @__PURE__ */ jsx("p", {
						className: "font-medium text-foreground",
						children: t("contact.sent", "Your message has been sent!")
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm",
						style: { color: "var(--ink-3)" },
						children: t("contact.sentDesc", "The seller will get back to you shortly.")
					}),
					/* @__PURE__ */ jsx(Button, {
						variant: "link",
						onClick: () => handleClose(false),
						className: "mt-2 h-auto p-0 text-sm",
						style: { color: "var(--ink-3)" },
						children: t("common.close", "Close")
					})
				]
			}) : /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "mt-2 space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsxs(Label$1, {
								htmlFor: "contact-name",
								className: "text-xs",
								children: [t("contact.name", "Name"), " *"]
							}), /* @__PURE__ */ jsx(Input, {
								id: "contact-name",
								required: true,
								value: form.name,
								onChange: (e) => setForm((f) => ({
									...f,
									name: e.target.value
								})),
								placeholder: "Jane Smith"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsx(Label$1, {
								htmlFor: "contact-phone",
								className: "text-xs",
								children: t("contact.phone", "Phone")
							}), /* @__PURE__ */ jsx(Input, {
								id: "contact-phone",
								type: "tel",
								value: form.phone,
								onChange: (e) => setForm((f) => ({
									...f,
									phone: e.target.value
								})),
								placeholder: "+45 000 000 00"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsxs(Label$1, {
							htmlFor: "contact-email",
							className: "text-xs",
							children: [t("contact.email", "Email"), " *"]
						}), /* @__PURE__ */ jsx(Input, {
							id: "contact-email",
							type: "email",
							required: true,
							value: form.email,
							onChange: (e) => setForm((f) => ({
								...f,
								email: e.target.value
							})),
							placeholder: "jane@example.com"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsxs(Label$1, {
							htmlFor: "contact-message",
							className: "text-xs",
							children: [t("contact.message", "Message"), " *"]
						}), /* @__PURE__ */ jsx(Textarea, {
							id: "contact-message",
							required: true,
							rows: 4,
							value: form.message,
							onChange: (e) => setForm((f) => ({
								...f,
								message: e.target.value
							})),
							placeholder: t("contact.messagePlaceholder", "Hi, I am interested in this listing..."),
							className: "resize-none"
						})]
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "submit",
						className: "h-auto w-full rounded-none bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-(--amber) hover:text-(--surface-0)",
						children: t("contact.send", "Send message")
					})
				]
			})]
		})
	});
}
var TIME_SLOTS = [
	"09:00",
	"10:00",
	"11:00",
	"12:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00"
];
function BookingDialog({ open, onOpenChange, listingTitle }) {
	const { t } = useTranslation();
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		date: "",
		time: "",
		notes: ""
	});
	const [submitted, setSubmitted] = useState(false);
	const handleSubmit = (e) => {
		e.preventDefault();
		setSubmitted(true);
	};
	const handleClose = (v) => {
		if (!v) {
			setForm({
				name: "",
				email: "",
				phone: "",
				date: "",
				time: "",
				notes: ""
			});
			setSubmitted(false);
		}
		onOpenChange(v);
	};
	return /* @__PURE__ */ jsx(Dialog$1, {
		open,
		onOpenChange: handleClose,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, {
				className: "font-display text-xl font-medium",
				children: t("listing.bookTour", "Book a tour")
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm",
				style: { color: "var(--ink-3)" },
				children: listingTitle
			})] }), submitted ? /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center gap-3 py-8 text-center",
				children: [
					/* @__PURE__ */ jsx(CheckCircle2, {
						className: "h-10 w-10",
						style: { color: "var(--amber)" },
						strokeWidth: 1.5
					}),
					/* @__PURE__ */ jsx("p", {
						className: "font-medium text-foreground",
						children: t("booking.confirmed", "Visit booked!")
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm",
						style: { color: "var(--ink-3)" },
						children: form.date && form.time ? `${form.date} · ${form.time}` : t("booking.confirmedDesc", "The seller will confirm your visit shortly.")
					}),
					/* @__PURE__ */ jsx(Button, {
						variant: "link",
						onClick: () => handleClose(false),
						className: "mt-2 h-auto p-0 text-sm",
						style: { color: "var(--ink-3)" },
						children: t("common.close", "Close")
					})
				]
			}) : /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "mt-2 space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsxs(Label$1, {
								htmlFor: "booking-name",
								className: "text-xs",
								children: [t("contact.name", "Name"), " *"]
							}), /* @__PURE__ */ jsx(Input, {
								id: "booking-name",
								required: true,
								value: form.name,
								onChange: (e) => setForm((f) => ({
									...f,
									name: e.target.value
								})),
								placeholder: "Jane Smith"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsx(Label$1, {
								htmlFor: "booking-phone",
								className: "text-xs",
								children: t("contact.phone", "Phone")
							}), /* @__PURE__ */ jsx(Input, {
								id: "booking-phone",
								type: "tel",
								value: form.phone,
								onChange: (e) => setForm((f) => ({
									...f,
									phone: e.target.value
								})),
								placeholder: "+45 000 000 00"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsxs(Label$1, {
							htmlFor: "booking-email",
							className: "text-xs",
							children: [t("contact.email", "Email"), " *"]
						}), /* @__PURE__ */ jsx(Input, {
							id: "booking-email",
							type: "email",
							required: true,
							value: form.email,
							onChange: (e) => setForm((f) => ({
								...f,
								email: e.target.value
							})),
							placeholder: "jane@example.com"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsxs(Label$1, {
								htmlFor: "booking-date",
								className: "text-xs",
								children: [t("booking.date", "Date"), " *"]
							}), /* @__PURE__ */ jsx(Input, {
								id: "booking-date",
								type: "date",
								required: true,
								min: today,
								value: form.date,
								onChange: (e) => setForm((f) => ({
									...f,
									date: e.target.value
								}))
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsxs(Label$1, {
								className: "text-xs",
								children: [t("booking.time", "Time"), " *"]
							}), /* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-2 gap-1",
								children: TIME_SLOTS.map((slot) => /* @__PURE__ */ jsx(Toggle$1, {
									pressed: form.time === slot,
									onPressedChange: () => setForm((f) => ({
										...f,
										time: slot
									})),
									variant: "outline",
									size: "sm",
									className: "h-auto w-full rounded px-2 py-1 text-xs data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background",
									children: slot
								}, slot))
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsx(Label$1, {
							htmlFor: "booking-notes",
							className: "text-xs",
							children: t("booking.notes", "Notes")
						}), /* @__PURE__ */ jsx(Textarea, {
							id: "booking-notes",
							rows: 2,
							value: form.notes,
							onChange: (e) => setForm((f) => ({
								...f,
								notes: e.target.value
							})),
							placeholder: t("booking.notesPlaceholder", "Any specific requests or questions..."),
							className: "resize-none"
						})]
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: !form.time,
						className: "h-auto w-full rounded-none bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-(--amber) hover:text-(--surface-0)",
						children: t("booking.confirm", "Confirm visit")
					})
				]
			})]
		})
	});
}
//#endregion
//#region src/routes/_public/listing/$slug.tsx?tsr-split=component
function ListingDetailRoute() {
	const { slug } = Route.useParams();
	return /* @__PURE__ */ jsx(ListingDetailPage, { slug });
}
//#endregion
export { ListingDetailRoute as component };
