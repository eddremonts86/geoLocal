import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { createListingFn } from '@/modules/listings/api/listings-mutations.fn'

export const Route = createFileRoute('/_account/account/listings/new')({
  component: NewListingPage,
})

type Category = 'property' | 'vehicle' | 'service' | 'experience'
type Txn = 'buy' | 'rent' | 'hire'

function NewListingPage() {
  const router = useRouter()
  const [category, setCategory] = useState<Category>('property')
  const [transactionType, setTxn] = useState<Txn>('rent')
  const [error, setError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: (data: Parameters<typeof createListingFn>[0]['data']) => createListingFn({ data }),
    onSuccess: (res) => {
      router.navigate({ to: '/account/listings/$id', params: { id: res.id } })
    },
    onError: (err: Error) => setError(err.message ?? 'Failed to create listing'),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const num = (k: string) => {
      const v = fd.get(k)
      const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN
      return Number.isFinite(n) ? n : undefined
    }
    const str = (k: string) => {
      const v = fd.get(k)
      return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
    }

    const imageUrls = ((fd.get('imageUrls') as string) ?? '')
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)

    const subCategory = (str('subCategory') ?? defaultSubCategory(category))!

    const property = category === 'property' ? {
      bedrooms: num('bedrooms'),
      bathrooms: num('bathrooms'),
      areaSqm: num('areaSqm'),
      yearBuilt: num('yearBuilt'),
    } : undefined
    const vehicle = category === 'vehicle' ? {
      make: str('make') ?? '',
      model: str('model') ?? '',
      year: num('year') ?? new Date().getFullYear(),
      mileageKm: num('mileageKm'),
    } : undefined
    const service = category === 'service' ? {
      serviceRadiusKm: num('serviceRadiusKm'),
      experienceYears: num('experienceYears'),
    } : undefined
    const experience = category === 'experience' ? {
      durationHours: num('durationHours'),
      maxGuests: num('maxGuests'),
    } : undefined

    create.mutate({
      category,
      subCategory,
      transactionType,
      title: str('title') ?? '',
      description: str('description'),
      price: num('price') ?? 0,
      currency: (str('currency') ?? 'DKK').toUpperCase(),
      pricePeriod: (str('pricePeriod') as 'one_time' | 'monthly' | 'daily' | 'hourly' | undefined) ?? undefined,
      latitude: num('latitude') ?? 55.6761,
      longitude: num('longitude') ?? 12.5683,
      addressLine1: str('addressLine1') ?? '',
      city: str('city') ?? '',
      region: str('region'),
      country: (str('country') ?? 'DK').toUpperCase(),
      contactMethod: ((str('contactMethod') as 'in_app' | 'email' | 'phone' | 'external_url') ?? 'in_app'),
      contactEmail: str('contactEmail'),
      contactPhone: str('contactPhone'),
      contactUrl: str('contactUrl'),
      imageUrls,
      property,
      vehicle,
      service,
      experience,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Create a new listing</h1>
        <p className="text-sm text-neutral-500">It will be saved as a draft. You can publish it from your dashboard.</p>
      </header>

      <Section title="What are you posting?">
        <Field label="Category">
          <Select value={category} onChange={(v) => setCategory(v as Category)}>
            <option value="property">Property</option>
            <option value="vehicle">Vehicle</option>
            <option value="service">Service</option>
            <option value="experience">Experience</option>
          </Select>
        </Field>
        <Field label="Transaction type">
          <Select value={transactionType} onChange={(v) => setTxn(v as Txn)}>
            <option value="rent">Rent</option>
            <option value="buy">Buy / Sell</option>
            <option value="hire">Hire / Book</option>
          </Select>
        </Field>
        <Field label="Sub-category">
          <Input name="subCategory" defaultValue={defaultSubCategory(category)} placeholder="apartment, sedan, plumber…" />
        </Field>
      </Section>

      <Section title="Basics">
        <Field label="Title (required)">
          <Input name="title" required minLength={3} maxLength={200} />
        </Field>
        <Field label="Description">
          <Textarea name="description" rows={4} maxLength={8000} />
        </Field>
        <Field label="Price (in minor units, e.g. 1500000 = 15,000.00 DKK)">
          <Input name="price" type="number" min={0} required />
        </Field>
        <Field label="Currency">
          <Input name="currency" defaultValue="DKK" maxLength={3} />
        </Field>
        <Field label="Price period (optional)">
          <Select name="pricePeriod" defaultValue="">
            <option value="">—</option>
            <option value="one_time">One-time</option>
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
            <option value="hourly">Hourly</option>
          </Select>
        </Field>
      </Section>

      <Section title="Location">
        <Field label="Address line 1">
          <Input name="addressLine1" required maxLength={500} />
        </Field>
        <Field label="City">
          <Input name="city" required maxLength={255} />
        </Field>
        <Field label="Region (optional)">
          <Input name="region" maxLength={255} />
        </Field>
        <Field label="Country (ISO-2)">
          <Input name="country" defaultValue="DK" maxLength={2} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude">
            <Input name="latitude" type="number" step="any" defaultValue={55.6761} required />
          </Field>
          <Field label="Longitude">
            <Input name="longitude" type="number" step="any" defaultValue={12.5683} required />
          </Field>
        </div>
      </Section>

      {category === 'property' && (
        <Section title="Property details">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bedrooms"><Input name="bedrooms" type="number" min={0} max={50} /></Field>
            <Field label="Bathrooms"><Input name="bathrooms" type="number" min={0} max={50} /></Field>
            <Field label="Area (m²)"><Input name="areaSqm" type="number" min={0} max={100000} /></Field>
            <Field label="Year built"><Input name="yearBuilt" type="number" min={1500} max={2100} /></Field>
          </div>
        </Section>
      )}

      {category === 'vehicle' && (
        <Section title="Vehicle details">
          <Field label="Make"><Input name="make" required maxLength={100} /></Field>
          <Field label="Model"><Input name="model" required maxLength={100} /></Field>
          <Field label="Year"><Input name="year" type="number" min={1900} max={2100} required /></Field>
          <Field label="Mileage (km)"><Input name="mileageKm" type="number" min={0} /></Field>
        </Section>
      )}

      {category === 'service' && (
        <Section title="Service details">
          <Field label="Service radius (km)"><Input name="serviceRadiusKm" type="number" min={0} /></Field>
          <Field label="Years of experience"><Input name="experienceYears" type="number" min={0} /></Field>
        </Section>
      )}

      {category === 'experience' && (
        <Section title="Experience details">
          <Field label="Duration (hours)"><Input name="durationHours" type="number" min={0} step="any" /></Field>
          <Field label="Max guests"><Input name="maxGuests" type="number" min={1} /></Field>
        </Section>
      )}

      <Section title="Photos">
        <Field label="Image URLs (one per line, up to 20)">
          <Textarea name="imageUrls" rows={4} placeholder="https://…" />
        </Field>
      </Section>

      <Section title="Contact preferences">
        <Field label="Method">
          <Select name="contactMethod" defaultValue="in_app">
            <option value="in_app">In-app messaging (recommended)</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="external_url">External URL</option>
          </Select>
        </Field>
        <Field label="Contact email"><Input name="contactEmail" type="email" /></Field>
        <Field label="Contact phone"><Input name="contactPhone" /></Field>
        <Field label="Contact URL"><Input name="contactUrl" type="url" /></Field>
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <footer className="flex items-center justify-end gap-3 border-t pt-6 dark:border-neutral-800">
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {create.isPending ? 'Creating…' : 'Save as draft'}
        </button>
      </footer>
    </form>
  )
}

function defaultSubCategory(c: Category): string {
  return c === 'property' ? 'apartment' : c === 'vehicle' ? 'sedan' : c === 'service' ? 'general' : 'tour'
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <legend className="px-2 text-sm font-medium">{title}</legend>
      <div className="space-y-3">{children}</div>
    </fieldset>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100'

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputCls} />
}
function Select({
  value,
  onChange,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { onChange?: (v: string) => void }) {
  return (
    <select
      {...rest}
      value={value}
      onChange={(e) => onChange?.(e.currentTarget.value)}
      className={inputCls}
    >
      {children}
    </select>
  )
}
