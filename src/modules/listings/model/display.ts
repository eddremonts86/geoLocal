import { Home, Car, Wrench, Sparkles, type LucideIcon } from 'lucide-react'
import type { ListingCategory, PricePeriod } from './types'

/** Lucide icon per top-level listing category. */
export const CATEGORY_ICONS: Record<ListingCategory, LucideIcon> = {
  property: Home,
  vehicle: Car,
  service: Wrench,
  experience: Sparkles,
}

/** CSS custom property for the accent color of each category. */
export const CATEGORY_ACCENT_VAR: Record<ListingCategory, string> = {
  property: 'var(--cat-property)',
  vehicle: 'var(--cat-vehicle)',
  service: 'var(--cat-service)',
  experience: 'var(--cat-experience)',
}

/** Shared editorial easing curve (quartic out). */
export const EDITORIAL_EASE = [0.25, 1, 0.5, 1] as [number, number, number, number]

const PRICE_PERIOD_SUFFIX: Record<Exclude<PricePeriod, 'one_time'>, string> = {
  monthly: '/mo',
  daily: '/day',
  hourly: '/hr',
}

function resolveLocale(languageCode: string | undefined): string {
  return languageCode === 'es' ? 'es-ES' : 'en-DK'
}

export interface FormattedPrice {
  /** Formatted currency amount (no period). */
  amount: string
  /** e.g. "/mo" for recurring periods, empty string for one-time. */
  suffix: string
}

export function formatListingPrice(
  price: number,
  currency: string | null | undefined,
  pricePeriod: PricePeriod | null | undefined,
  languageCode: string | undefined,
): FormattedPrice {
  const amount = new Intl.NumberFormat(resolveLocale(languageCode), {
    style: 'currency',
    currency: currency ?? 'DKK',
    maximumFractionDigits: 0,
  }).format(price)

  const suffix = pricePeriod && pricePeriod !== 'one_time'
    ? PRICE_PERIOD_SUFFIX[pricePeriod]
    : ''

  return { amount, suffix }
}
