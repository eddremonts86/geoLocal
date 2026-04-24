import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { EditorialPage } from '@/components/composite/editorial-page'

export const Route = createFileRoute('/_public/contact')({
  component: ContactPage,
})

function ContactPage() {
  const { t } = useTranslation()

  return (
    <EditorialPage
      eyebrow={t('contact.eyebrow', '06 · Contact')}
      title={t('contact.title', 'Write us a note.')}
      lede={t(
        'contact.lede',
        'Questions about a listing, partnerships, or simply saying hello — we read every message and reply within two working days.',
      )}
    >
      <div className="grid grid-cols-12 gap-x-6 gap-y-14">
        {/* Channels */}
        <aside className="col-span-12 md:col-span-5">
          <p className="meta-label mb-6" style={{ color: 'var(--ink-3)' }}>
            {t('contact.channelsLabel', 'Channels')}
          </p>
          <ul className="space-y-6">
            <ChannelRow
              icon={Mail}
              label={t('contact.mailLabel', 'Email')}
              value="hello@geolocal.cph"
              href="mailto:hello@geolocal.cph"
            />
            <ChannelRow
              icon={Phone}
              label={t('contact.phoneLabel', 'Phone')}
              value="+45 3216 5555"
              href="tel:+4532165555"
            />
            <ChannelRow
              icon={MapPin}
              label={t('contact.studioLabel', 'Studio')}
              value="Gothersgade 14, 1123 København K"
            />
          </ul>

          <p className="meta-label mt-10" style={{ color: 'var(--ink-4)' }}>
            {t('contact.hoursLabel', 'Monday\u2013Friday · 09:00\u201317:00 CET')}
          </p>
        </aside>

        {/* Form */}
        <form
          className="col-span-12 space-y-8 md:col-span-7"
          onSubmit={(e) => {
            e.preventDefault()
            // Static page — wire to a backend endpoint later.
          }}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label={t('contact.form.name', 'Name')} name="name" required />
            <FormField
              label={t('contact.form.email', 'Email')}
              name="email"
              type="email"
              required
            />
          </div>
          <FormField label={t('contact.form.subject', 'Subject')} name="subject" />
          <FormTextArea label={t('contact.form.message', 'Message')} name="message" required />

          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="meta-label" style={{ color: 'var(--ink-4)' }}>
              {t('contact.form.privacy', 'We respect your privacy.')}
            </p>
            <button
              type="submit"
              className="group inline-flex items-center gap-2 bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[var(--amber)] hover:text-[var(--surface-0)]"
            >
              {t('contact.form.send', 'Send message')}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
        </form>
      </div>
    </EditorialPage>
  )
}

function ChannelRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail
  label: string
  value: string
  href?: string
}) {
  const content = (
    <>
      <Icon className="h-4 w-4" strokeWidth={1.5} style={{ color: 'var(--ink-3)' }} />
      <div className="min-w-0 flex-1">
        <p className="meta-label" style={{ color: 'var(--ink-3)' }}>
          {label}
        </p>
        <p className="mt-1 text-base text-foreground">{value}</p>
      </div>
    </>
  )
  return (
    <li>
      {href ? (
        <a
          href={href}
          className="group flex items-start gap-4 border-b border-border pb-5 transition-colors hover:border-[var(--amber)]"
        >
          {content}
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            style={{ color: 'var(--ink-3)' }}
          />
        </a>
      ) : (
        <div className="flex items-start gap-4 border-b border-border pb-5">{content}</div>
      )}
    </li>
  )
}

function FormField({
  label,
  name,
  type = 'text',
  required,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
        {label}
        {required && <span style={{ color: 'var(--amber-ink)' }}> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border-b border-border bg-transparent py-2 text-base text-foreground outline-none transition-colors focus:border-foreground"
      />
    </label>
  )
}

function FormTextArea({
  label,
  name,
  required,
}: {
  label: string
  name: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="meta-label" style={{ color: 'var(--ink-3)' }}>
        {label}
        {required && <span style={{ color: 'var(--amber-ink)' }}> *</span>}
      </span>
      <textarea
        name={name}
        required={required}
        rows={5}
        className="mt-2 w-full resize-none border-b border-border bg-transparent py-2 text-base text-foreground outline-none transition-colors focus:border-foreground"
      />
    </label>
  )
}
