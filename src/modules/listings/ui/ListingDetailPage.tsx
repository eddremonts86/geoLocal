import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { m } from 'framer-motion'
import { ArrowLeft, Heart, MapPin, CheckCircle2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { listingDetailQueryOptions } from '@/modules/listings/api/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Toggle } from '@/components/ui/toggle'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EDITORIAL_EASE, formatListingPrice } from '@/modules/listings/model/display'
import { ListingGallery } from '@/modules/listings/ui/ListingGallery'
import { ListingStatsBar } from '@/modules/listings/ui/ListingStatsBar'
import { ListingStory } from '@/modules/listings/ui/ListingStory'
import { ListingHighlights } from '@/modules/listings/ui/ListingHighlights'
import { ListingLocation } from '@/modules/listings/ui/ListingLocation'
import { ListingSource } from '@/modules/listings/ui/ListingSource'
import { ListingSimilar } from '@/modules/listings/ui/ListingSimilar'
import { ShareMenu } from '@/modules/listings/ui/ShareMenu'
import { ContactButton } from '@/modules/listings/ui/ContactButton'
import { ReportButton } from '@/modules/listings/ui/ReportButton'
import { StripeCheckoutButton } from '@/modules/listings/ui/StripeCheckoutButton'
import { useFavorites } from '@/modules/favorites/ui/useFavorites'

interface ListingDetailPageProps {
  slug: string
}

export function ListingDetailPage({ slug }: ListingDetailPageProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { data: listing, isLoading, isError } = useQuery(listingDetailQueryOptions(slug, i18n.language))
  const [contactOpen, setContactOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const { isFavorite, toggle: toggleFavorite } = useFavorites()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-8 px-6 pb-32 pt-6 md:px-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 w-3/4" />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.55fr_1fr]">
          <Skeleton className="h-[560px] w-full" />
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            <Skeleton /><Skeleton /><Skeleton /><Skeleton />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !listing) {
    return (
      <div className="flex flex-col items-center gap-4 p-16 text-center">
        <p className="text-lg text-muted-foreground">{t('listing.notFound', 'Listing not found')}</p>
        <Button variant="outline" onClick={() => navigate({ to: '/explore' })}>
          {t('listing.backToExplore', 'Back to explore')}
        </Button>
      </div>
    )
  }

  const { amount: formattedPrice, suffix: priceSuffix } = formatListingPrice(
    listing.price,
    listing.currency,
    listing.pricePeriod,
    i18n.language,
  )

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-[1400px] px-6 pb-32 pt-6 md:pb-24 md:px-10"
    >
      {/* ─── Chrome: back + actions ─────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/explore' })}
          className="group h-auto gap-2 rounded-none px-0 py-0 text-sm hover:bg-transparent hover:text-foreground"
          style={{ color: 'var(--ink-2)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          <span className="meta-label">{t('listing.back', 'Back')}</span>
        </Button>

        <div className="flex items-center gap-1">
          <ShareMenu
            title={listing.title}
            text={listing.summary ?? undefined}
            ariaLabel={t('share.label', 'Share listing')}
          />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-none hover:text-(--red)"
            style={{ color: isFavorite(listing.id) ? 'var(--red)' : 'var(--ink-3)' }}
            aria-label={isFavorite(listing.id) ? t('listing.unfavorite', 'Remove from favorites') : t('listing.favorite', 'Save to favorites')}
            onClick={() => toggleFavorite(listing.id)}
          >
            <Heart
              className="h-4 w-4"
              strokeWidth={1.5}
              style={{ fill: isFavorite(listing.id) ? 'var(--red)' : 'transparent' }}
            />
          </Button>
        </div>
      </div>

      {/* ─── Editorial headline strip ────────────────────────────── */}
      <header className="mb-8 grid grid-cols-12 gap-6 md:mb-10">
        <div className="col-span-12 md:col-span-9">
          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="meta-label" style={{ color: 'var(--amber-ink)' }}>
              {listing.transactionType}
            </span>
            <span style={{ color: 'var(--ink-4)' }}>·</span>
            <span className="meta-label" style={{ color: 'var(--ink-3)' }}>{listing.category}</span>
            <span style={{ color: 'var(--ink-4)' }}>·</span>
            <span className="meta-label" style={{ color: 'var(--ink-3)' }}>{listing.subCategory}</span>
            {listing.scrapedSource && (
              <>
                <span style={{ color: 'var(--ink-4)' }}>·</span>
                <ListingSource
                  scrapedSource={listing.scrapedSource}
                  scrapedSourceUrl={listing.scrapedSourceUrl}
                  variant="inline"
                />
              </>
            )}
          </div>
          <h1 className="font-display text-[clamp(2.25rem,1.6rem+3vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.025em] text-foreground">
            {listing.title}
          </h1>
          <div className="mt-5 flex items-center gap-1.5 text-sm" style={{ color: 'var(--ink-2)' }}>
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
            {[listing.addressLine1, listing.city, listing.country].filter(Boolean).join(', ')}
          </div>
        </div>

        <div className="col-span-12 flex items-end justify-start md:col-span-3 md:justify-end">
          <div className="text-left md:text-right">
            <div className="meta-label mb-1" style={{ color: 'var(--ink-3)' }}>
              {t('editorial.price', 'Price')}
            </div>
            <p className="font-display text-3xl font-medium tabular-nums tracking-[-0.015em] text-foreground md:text-4xl">
              {formattedPrice}
            </p>
            {priceSuffix && (
              <p className="text-xs tabular-nums" style={{ color: 'var(--ink-3)' }}>
                {priceSuffix}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* ─── Gallery ─────────────────────────────────────────────── */}
      <ListingGallery assets={listing.assets} title={listing.title} />

      {/* ─── Stats bar ───────────────────────────────────────────── */}
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: EDITORIAL_EASE }}
        className="mt-8 md:mt-12"
      >
        <ListingStatsBar listing={listing} />
      </m.div>

      {/* ─── Two-column body ─────────────────────────────────────── */}
      <div className="mt-10 grid grid-cols-12 gap-x-8 gap-y-12 md:mt-14">
        {/* LEFT — narrative */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EDITORIAL_EASE }}
          className="col-span-12 space-y-12 md:col-span-8"
        >
          {listing.description && (
            <>
              <ListingStory
                description={listing.description}
                summary={listing.summary}
                sectionNumber="01"
              />
              <Separator />
              <ListingHighlights
                description={listing.description}
                features={listing.features}
                sectionNumber="02"
              />
            </>
          )}

          <Separator />

          <ListingLocation listing={listing} sectionNumber="03" />
        </m.div>

        {/* RIGHT — sticky action rail */}
        <m.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26, ease: EDITORIAL_EASE }}
          className="col-span-12 md:col-span-4"
        >
          <div className="sticky top-24 space-y-5">
            {/* Action card */}
            <div className="border p-5" style={{ borderColor: 'var(--line-1)' }}>
              <div className="meta-label mb-2" style={{ color: 'var(--ink-3)' }}>
                {t('editorial.price', 'Price')}
              </div>
              <p className="mb-5 font-display text-3xl font-medium tabular-nums tracking-tight text-foreground md:text-4xl">
                {formattedPrice}
                {priceSuffix && (
                  <span className="ml-1 text-base font-normal" style={{ color: 'var(--ink-3)' }}>
                    {priceSuffix}
                  </span>
                )}
              </p>
              <div className="hidden space-y-2 md:block">
                {/*
                 * Marketplace flow: when the listing belongs to a user and the
                 * owner chose in-app messaging, route the contact CTA through
                 * the real `startThreadFn` server fn (Phase 2). Otherwise fall
                 * back to the legacy mock dialog.
                 */}
                {listing.sourceKind === 'user' && listing.contactMethod === 'in_app' && listing.ownerId ? (
                  <ContactButton
                    listingId={listing.id}
                    ownerId={listing.ownerId}
                    label={
                      listing.category === 'service'
                        ? t('listing.requestService', 'Request service')
                        : t('listing.contact', 'Contact seller')
                    }
                    className="h-auto w-full rounded-none bg-foreground px-6 py-4 text-sm font-medium text-background hover:bg-(--amber) hover:text-(--surface-0)"
                  />
                ) : (
                  <Button
                    onClick={() => setContactOpen(true)}
                    className="h-auto w-full rounded-none bg-foreground px-6 py-4 text-sm font-medium text-background hover:bg-(--amber) hover:text-(--surface-0)"
                  >
                    {listing.category === 'service'
                      ? t('listing.requestService', 'Request service')
                      : t('listing.contact', 'Contact seller')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setBookingOpen(true)}
                  className="h-auto w-full rounded-none px-6 py-4 text-sm font-medium hover:bg-(--surface-2)"
                >
                  {t('listing.bookTour', 'Book a tour')}
                </Button>
                {listing.sourceKind === 'user' && listing.ownerId && listing.price >= 0.5 ? (
                  <StripeCheckoutButton
                    listingId={listing.id}
                    amount={Math.round(listing.price * 100)}
                    currency={listing.currency || 'DKK'}
                    intent={
                      listing.category === 'service'
                        ? 'service'
                        : listing.category === 'experience'
                          ? 'booking'
                          : 'sale'
                    }
                    label={t('listing.buyNow', 'Pay securely · {{price}} {{currency}}', {
                      price: listing.price.toLocaleString(),
                      currency: listing.currency || 'DKK',
                    })}
                  />
                ) : null}
              </div>
            </div>

            {/* Source attribution card */}
            {listing.scrapedSource && (
              <ListingSource
                scrapedSource={listing.scrapedSource}
                scrapedSourceUrl={listing.scrapedSourceUrl}
                variant="block"
              />
            )}

            {/* Meta footer */}
            <div className="text-xs" style={{ color: 'var(--ink-3)' }}>
              <p>
                {t('listing.published', 'Published')}{' '}
                <span className="tabular-nums">
                  {listing.publishedAt
                    ? new Date(listing.publishedAt).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-DK', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </p>
              <div className="mt-3">
                <ReportButton listingId={listing.id} />
              </div>
            </div>
          </div>
        </m.aside>
      </div>

      {/* ─── Similar listings ─────────────────────────────────────── */}
      <ListingSimilar
        category={listing.category}
        city={listing.city}
        excludeId={listing.id}
        sectionNumber="04"
      />

      {/* ─── Dialogs ──────────────────────────────────────────────── */}
      <ContactDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        listingTitle={listing.title}
        isService={listing.category === 'service'}
      />
      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        listingTitle={listing.title}
      />

      {/* ─── Mobile sticky CTA bar ────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-border bg-background/95 p-4 backdrop-blur-sm md:hidden">
        {listing.sourceKind === 'user' && listing.contactMethod === 'in_app' && listing.ownerId ? (
          <ContactButton
            listingId={listing.id}
            ownerId={listing.ownerId}
            label={
              listing.category === 'service'
                ? t('listing.requestService', 'Request service')
                : t('listing.contact', 'Contact seller')
            }
            className="h-auto flex-1 rounded-none bg-foreground py-3.5 text-sm font-medium text-background active:opacity-80"
          />
        ) : (
          <Button
            onClick={() => setContactOpen(true)}
            className="h-auto flex-1 rounded-none bg-foreground py-3.5 text-sm font-medium text-background active:opacity-80"
          >
            {listing.category === 'service'
              ? t('listing.requestService', 'Request service')
              : t('listing.contact', 'Contact seller')}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => setBookingOpen(true)}
          className="h-auto flex-1 rounded-none py-3.5 text-sm font-medium active:bg-(--surface-2)"
        >
          {t('listing.bookTour', 'Book a tour')}
        </Button>
      </div>
    </m.div>
  )
}

// ─── Contact dialog ────────────────────────────────────────────────────────

function ContactDialog({
  open,
  onOpenChange,
  listingTitle,
  isService,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  listingTitle: string
  isService: boolean
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleClose = (v: boolean) => {
    if (!v) {
      setForm({ name: '', email: '', phone: '', message: '' })
      setSubmitted(false)
    }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-medium">
            {isService ? t('listing.requestService', 'Request service') : t('listing.contact', 'Contact seller')}
          </DialogTitle>
          <p className="text-sm" style={{ color: 'var(--ink-3)' }}>{listingTitle}</p>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-10 w-10" style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
            <p className="font-medium text-foreground">
              {t('contact.sent', 'Your message has been sent!')}
            </p>
            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
              {t('contact.sentDesc', 'The seller will get back to you shortly.')}
            </p>
            <Button
              variant="link"
              onClick={() => handleClose(false)}
              className="mt-2 h-auto p-0 text-sm"
              style={{ color: 'var(--ink-3)' }}
            >
              {t('common.close', 'Close')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name" className="text-xs">
                  {t('contact.name', 'Name')} *
                </Label>
                <Input
                  id="contact-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone" className="text-xs">
                  {t('contact.phone', 'Phone')}
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+45 000 000 00"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email" className="text-xs">
                {t('contact.email', 'Email')} *
              </Label>
              <Input
                id="contact-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-message" className="text-xs">
                {t('contact.message', 'Message')} *
              </Label>
              <Textarea
                id="contact-message"
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder={t('contact.messagePlaceholder', 'Hi, I am interested in this listing...')}
                className="resize-none"
              />
            </div>
            <Button
              type="submit"
              className="h-auto w-full rounded-none bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-(--amber) hover:text-(--surface-0)"
            >
              {t('contact.send', 'Send message')}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Booking dialog ────────────────────────────────────────────────────────

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

function BookingDialog({
  open,
  onOpenChange,
  listingTitle,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  listingTitle: string
}) {
  const { t } = useTranslation()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '', notes: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleClose = (v: boolean) => {
    if (!v) {
      setForm({ name: '', email: '', phone: '', date: '', time: '', notes: '' })
      setSubmitted(false)
    }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-medium">
            {t('listing.bookTour', 'Book a tour')}
          </DialogTitle>
          <p className="text-sm" style={{ color: 'var(--ink-3)' }}>{listingTitle}</p>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-10 w-10" style={{ color: 'var(--amber)' }} strokeWidth={1.5} />
            <p className="font-medium text-foreground">
              {t('booking.confirmed', 'Visit booked!')}
            </p>
            <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
              {form.date && form.time
                ? `${form.date} · ${form.time}`
                : t('booking.confirmedDesc', 'The seller will confirm your visit shortly.')}
            </p>
            <Button
              variant="link"
              onClick={() => handleClose(false)}
              className="mt-2 h-auto p-0 text-sm"
              style={{ color: 'var(--ink-3)' }}
            >
              {t('common.close', 'Close')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="booking-name" className="text-xs">
                  {t('contact.name', 'Name')} *
                </Label>
                <Input
                  id="booking-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="booking-phone" className="text-xs">
                  {t('contact.phone', 'Phone')}
                </Label>
                <Input
                  id="booking-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+45 000 000 00"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="booking-email" className="text-xs">
                {t('contact.email', 'Email')} *
              </Label>
              <Input
                id="booking-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="booking-date" className="text-xs">
                  {t('booking.date', 'Date')} *
                </Label>
                <Input
                  id="booking-date"
                  type="date"
                  required
                  min={today}
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {t('booking.time', 'Time')} *
                </Label>
                <div className="grid grid-cols-2 gap-1">
                  {TIME_SLOTS.map((slot) => (
                    <Toggle
                      key={slot}
                      pressed={form.time === slot}
                      onPressedChange={() => setForm((f) => ({ ...f, time: slot }))}
                      variant="outline"
                      size="sm"
                      className="h-auto w-full rounded px-2 py-1 text-xs data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
                    >
                      {slot}
                    </Toggle>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="booking-notes" className="text-xs">
                {t('booking.notes', 'Notes')}
              </Label>
              <Textarea
                id="booking-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder={t('booking.notesPlaceholder', 'Any specific requests or questions...')}
                className="resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={!form.time}
              className="h-auto w-full rounded-none bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-(--amber) hover:text-(--surface-0)"
            >
              {t('booking.confirm', 'Confirm visit')}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )

}
