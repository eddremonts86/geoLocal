import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { m, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react'
import { createListingFn } from '@/modules/admin/api/admin-listings.fn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  PROPERTY_SUBCATEGORIES,
  VEHICLE_SUBCATEGORIES,
  SERVICE_SUBCATEGORIES,
} from '@/modules/listings/model/types'
import type { ListingCategory, TransactionType, PricePeriod } from '@/modules/listings/model/types'

const STEPS = ['Category', 'Details', 'Specifics', 'Location', 'Images', 'Review'] as const

interface FormData {
  category: ListingCategory
  subCategory: string
  transactionType: TransactionType
  titleEn: string
  titleEs: string
  summaryEn: string
  descriptionEn: string
  descriptionEs: string
  price: number
  currency: string
  pricePeriod: PricePeriod | null
  latitude: number
  longitude: number
  addressLine1: string
  city: string
  region: string
  country: string
  featured: boolean
  // Property
  bedrooms: number | null
  bathrooms: number | null
  areaSqm: number | null
  yearBuilt: number | null
  parkingSpaces: number | null
  furnished: boolean
  // Vehicle
  make: string
  model: string
  year: number
  mileageKm: number | null
  fuelType: string
  transmission: string
  color: string
  // Service
  serviceRadiusKm: number | null
  experienceYears: number | null
  responseTime: string
  // Assets
  imageUrls: string[]
  coverIndex: number
}

const defaultForm: FormData = {
  category: 'property',
  subCategory: '',
  transactionType: 'buy',
  titleEn: '',
  titleEs: '',
  summaryEn: '',
  descriptionEn: '',
  descriptionEs: '',
  price: 0,
  currency: 'DKK',
  pricePeriod: null,
  latitude: 55.6761,
  longitude: 12.5683,
  addressLine1: '',
  city: 'Copenhagen',
  region: '',
  country: 'Denmark',
  featured: false,
  bedrooms: null,
  bathrooms: null,
  areaSqm: null,
  yearBuilt: null,
  parkingSpaces: null,
  furnished: false,
  make: '',
  model: '',
  year: new Date().getFullYear(),
  mileageKm: null,
  fuelType: '',
  transmission: '',
  color: '',
  serviceRadiusKm: null,
  experienceYears: null,
  responseTime: '',
  imageUrls: [],
  coverIndex: 0,
}

interface ListingFormPageProps {
  initialCategory?: string
}

export function ListingFormPage({ initialCategory }: ListingFormPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(() => ({
    ...defaultForm,
    category: (initialCategory as ListingCategory) || 'property',
  }))
  const [newImageUrl, setNewImageUrl] = useState('')

  const mutation = useMutation({
    mutationFn: (status: 'draft' | 'published') =>
      createListingFn({
        data: {
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
          translations: [
            { locale: 'en', title: form.titleEn, summary: form.summaryEn || null, description: form.descriptionEn || null, neighborhood: null },
            ...(form.titleEs ? [{ locale: 'es', title: form.titleEs, summary: null, description: form.descriptionEs || null, neighborhood: null }] : []),
          ],
          ...(form.category === 'property'
            ? { bedrooms: form.bedrooms, bathrooms: form.bathrooms, areaSqm: form.areaSqm, yearBuilt: form.yearBuilt, parkingSpaces: form.parkingSpaces, furnished: form.furnished }
            : {}),
          ...(form.category === 'vehicle'
            ? { make: form.make, model: form.model, year: form.year, mileageKm: form.mileageKm, fuelType: (form.fuelType || null) as 'gasoline' | 'diesel' | 'electric' | 'hybrid' | null, transmission: (form.transmission || null) as 'manual' | 'automatic' | null, color: form.color || null }
            : {}),
          ...(form.category === 'service'
            ? { serviceRadiusKm: form.serviceRadiusKm, experienceYears: form.experienceYears, responseTime: form.responseTime || null }
            : {}),
          assets: form.imageUrls.map((url, i) => ({
            kind: 'image',
            url,
            altText: null,
            sortOrder: i,
            isCover: i === form.coverIndex,
          })),
        },
      }),
    onSuccess: () => navigate({ to: '/admin/listings' }),
  })

  const update = (partial: Partial<FormData>) => setForm((f) => ({ ...f, ...partial }))

  const subCategories =
    form.category === 'property' ? PROPERTY_SUBCATEGORIES
      : form.category === 'vehicle' ? VEHICLE_SUBCATEGORIES
        : SERVICE_SUBCATEGORIES

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.newListing', 'New Listing')}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => mutation.mutate('draft')}
          disabled={mutation.isPending || !form.titleEn}
        >
          <Save className="mr-2 h-4 w-4" />
          {t('admin.saveDraft', 'Save Draft')}
        </Button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <button
              onClick={() => setStep(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition ${
                i < step ? 'bg-primary text-primary-foreground'
                  : i === step ? 'bg-primary/20 text-primary ring-2 ring-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </button>
            <span className="hidden text-xs text-muted-foreground sm:inline">{label}</span>
            {i < STEPS.length - 1 && <div className="mx-1 h-px w-4 bg-border sm:w-8" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <m.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="space-y-4 p-6">
              {/* Step 0: Category */}
              {step === 0 && (
                <>
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Category & Type</CardTitle>
                  </CardHeader>
                  <div className="grid grid-cols-3 gap-3">
                    {(['property', 'vehicle', 'service'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => update({ category: cat, subCategory: '' })}
                        className={`rounded-lg border-2 p-4 text-center capitalize transition ${
                          form.category === cat ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sub-category</label>
                    <Select value={form.subCategory} onValueChange={(v) => update({ subCategory: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories.map((sc) => (
                          <SelectItem key={sc} value={sc}>{sc.replace(/_/g, ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Transaction type</label>
                    <div className="mt-1 flex gap-2">
                      {(['buy', 'rent', 'hire'] as const).map((tt) => (
                        <button
                          key={tt}
                          onClick={() => update({ transactionType: tt })}
                          className={`rounded-md border px-4 py-2 text-sm capitalize transition ${
                            form.transactionType === tt ? 'border-primary bg-primary/10' : 'border-border'
                          }`}
                        >
                          {tt}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Step 1: Details */}
              {step === 1 && (
                <>
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Basic Details</CardTitle>
                  </CardHeader>
                  <div>
                    <label className="text-sm font-medium">Title (English) *</label>
                    <Input value={form.titleEn} onChange={(e) => update({ titleEn: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title (Español)</label>
                    <Input value={form.titleEs} onChange={(e) => update({ titleEs: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Summary</label>
                    <Input value={form.summaryEn} onChange={(e) => update({ summaryEn: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description (English)</label>
                    <textarea
                      value={form.descriptionEn}
                      onChange={(e) => update({ descriptionEn: e.target.value })}
                      rows={4}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description (Español)</label>
                    <textarea
                      value={form.descriptionEs}
                      onChange={(e) => update({ descriptionEs: e.target.value })}
                      rows={4}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium">Price *</label>
                      <Input type="number" value={form.price || ''} onChange={(e) => update({ price: Number(e.target.value) })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Currency</label>
                      <Select value={form.currency} onValueChange={(v) => update({ currency: v })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DKK">DKK</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Period</label>
                      <Select value={form.pricePeriod ?? 'one_time'} onValueChange={(v) => update({ pricePeriod: v as PricePeriod })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_time">One-time</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => update({ featured: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <label className="text-sm">Featured listing</label>
                  </div>
                </>
              )}

              {/* Step 2: Category-specific */}
              {step === 2 && (
                <>
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>{form.category === 'property' ? 'Property Details' : form.category === 'vehicle' ? 'Vehicle Details' : 'Service Details'}</CardTitle>
                  </CardHeader>
                  {form.category === 'property' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Bedrooms</label>
                        <Input type="number" value={form.bedrooms ?? ''} onChange={(e) => update({ bedrooms: e.target.value ? Number(e.target.value) : null })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Bathrooms</label>
                        <Input type="number" value={form.bathrooms ?? ''} onChange={(e) => update({ bathrooms: e.target.value ? Number(e.target.value) : null })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Area (m²)</label>
                        <Input type="number" value={form.areaSqm ?? ''} onChange={(e) => update({ areaSqm: e.target.value ? Number(e.target.value) : null })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Year Built</label>
                        <Input type="number" value={form.yearBuilt ?? ''} onChange={(e) => update({ yearBuilt: e.target.value ? Number(e.target.value) : null })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Parking Spaces</label>
                        <Input type="number" value={form.parkingSpaces ?? ''} onChange={(e) => update({ parkingSpaces: e.target.value ? Number(e.target.value) : null })} className="mt-1" />
                      </div>
                      <div className="flex items-center gap-2 self-end pb-2">
                        <input type="checkbox" checked={form.furnished} onChange={(e) => update({ furnished: e.target.checked })} className="h-4 w-4" />
                        <label className="text-sm">Furnished</label>
                      </div>
                    </div>
                  )}
                  {form.category === 'vehicle' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Make *</label>
                        <Input value={form.make} onChange={(e) => update({ make: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Model *</label>
                        <Input value={form.model} onChange={(e) => update({ model: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Year *</label>
                        <Input type="number" value={form.year} onChange={(e) => update({ year: Number(e.target.value) })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Mileage (km)</label>
                        <Input type="number" value={form.mileageKm ?? ''} onChange={(e) => update({ mileageKm: e.target.value ? Number(e.target.value) : null })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Fuel Type</label>
                        <Select value={form.fuelType} onValueChange={(v) => update({ fuelType: v })}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gasoline">Gasoline</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Transmission</label>
                        <Select value={form.transmission} onValueChange={(v) => update({ transmission: v })}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="automatic">Automatic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Color</label>
                        <Input value={form.color} onChange={(e) => update({ color: e.target.value })} className="mt-1" />
                      </div>
                    </div>
                  )}
                  {form.category === 'service' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Service Radius (km)</label>
                        <Input type="number" value={form.serviceRadiusKm ?? ''} onChange={(e) => update({ serviceRadiusKm: e.target.value ? Number(e.target.value) : null })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Experience (years)</label>
                        <Input type="number" value={form.experienceYears ?? ''} onChange={(e) => update({ experienceYears: e.target.value ? Number(e.target.value) : null })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Response Time</label>
                        <Input value={form.responseTime} onChange={(e) => update({ responseTime: e.target.value })} placeholder="e.g. Same day" className="mt-1" />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step 3: Location */}
              {step === 3 && (
                <>
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <div>
                    <label className="text-sm font-medium">Address *</label>
                    <Input value={form.addressLine1} onChange={(e) => update({ addressLine1: e.target.value })} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium">City *</label>
                      <Input value={form.city} onChange={(e) => update({ city: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Region</label>
                      <Input value={form.region} onChange={(e) => update({ region: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Country</label>
                      <Input value={form.country} onChange={(e) => update({ country: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Latitude</label>
                      <Input type="number" step="any" value={form.latitude} onChange={(e) => update({ latitude: Number(e.target.value) })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Longitude</label>
                      <Input type="number" step="any" value={form.longitude} onChange={(e) => update({ longitude: Number(e.target.value) })} className="mt-1" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Default: Copenhagen center (55.6761, 12.5683)</p>
                </>
              )}

              {/* Step 4: Images */}
              {step === 4 && (
                <>
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Images</CardTitle>
                  </CardHeader>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste image URL..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (newImageUrl.trim()) {
                          update({ imageUrls: [...form.imageUrls, newImageUrl.trim()] })
                          setNewImageUrl('')
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {form.imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {form.imageUrls.map((url, i) => (
                        <div key={i} className="group relative">
                          <img src={url ?? '/img-placeholder.svg'} alt="" className="h-24 w-full rounded-md object-cover" onError={(e) => { e.currentTarget.src = '/img-placeholder.svg'; e.currentTarget.onerror = null }} />
                          <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-md bg-black/50 opacity-0 transition group-hover:opacity-100">
                            <button
                              onClick={() => update({ coverIndex: i })}
                              className={`rounded px-2 py-1 text-xs ${i === form.coverIndex ? 'bg-primary text-white' : 'bg-white/80 text-black'}`}
                            >
                              {i === form.coverIndex ? 'Cover ✓' : 'Set Cover'}
                            </button>
                            <button
                              onClick={() => {
                                const urls = form.imageUrls.filter((_, j) => j !== i)
                                update({ imageUrls: urls, coverIndex: Math.min(form.coverIndex, urls.length - 1) })
                              }}
                              className="rounded bg-red-500 px-2 py-1 text-xs text-white"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.imageUrls.length === 0 && (
                    <p className="text-sm text-muted-foreground">No images added yet</p>
                  )}
                </>
              )}

              {/* Step 5: Review */}
              {step === 5 && (
                <>
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Review & Publish</CardTitle>
                  </CardHeader>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <Badge>{form.category}</Badge>
                      <Badge variant="outline">{form.subCategory || 'No sub-category'}</Badge>
                      <Badge variant="secondary">{form.transactionType}</Badge>
                    </div>
                    <Separator />
                    <div><strong>Title:</strong> {form.titleEn || '(empty)'}</div>
                    <div><strong>Price:</strong> {form.price} {form.currency}</div>
                    <div><strong>Location:</strong> {form.addressLine1}, {form.city}, {form.country}</div>
                    <div><strong>Coordinates:</strong> {form.latitude}, {form.longitude}</div>
                    <div><strong>Images:</strong> {form.imageUrls.length}</div>
                    {form.category === 'property' && (
                      <div><strong>Property:</strong> {form.bedrooms} beds, {form.bathrooms} baths, {form.areaSqm}m²</div>
                    )}
                    {form.category === 'vehicle' && (
                      <div><strong>Vehicle:</strong> {form.make} {form.model} {form.year}</div>
                    )}
                    {form.category === 'service' && (
                      <div><strong>Service:</strong> {form.experienceYears} yrs exp, {form.serviceRadiusKm}km radius</div>
                    )}
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => mutation.mutate('draft')}
                      disabled={mutation.isPending || !form.titleEn}
                    >
                      {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save as Draft
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => mutation.mutate('published')}
                      disabled={mutation.isPending || !form.titleEn}
                    >
                      {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Publish
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </m.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        {step < STEPS.length - 1 && (
          <Button onClick={() => setStep((s) => s + 1)}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
