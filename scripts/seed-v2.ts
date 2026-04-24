import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { randomUUID } from 'node:crypto'
import { sql } from 'drizzle-orm'
import {
  listings,
  listingProperties,
  listingVehicles,
  listingServices,
  listingTranslations,
  listingAssets,
  listingFeatures,
} from '../src/shared/lib/db/schema'

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5434/geo_dashboard'

const client = postgres(DATABASE_URL, { prepare: false })
const db = drizzle(client)

// ─── Copenhagen neighborhoods ──────────────────────────────────────────────

const NEIGHBORHOODS = [
  { key: 'indre-by', en: 'Indre By', es: 'Centro', lat: [55.675, 55.684], lng: [12.566, 12.583] },
  { key: 'norrebro', en: 'Nørrebro', es: 'Nørrebro', lat: [55.690, 55.702], lng: [12.540, 12.565] },
  { key: 'vesterbro', en: 'Vesterbro', es: 'Vesterbro', lat: [55.665, 55.677], lng: [12.540, 12.565] },
  { key: 'osterbro', en: 'Østerbro', es: 'Østerbro', lat: [55.695, 55.710], lng: [12.570, 12.590] },
  { key: 'frederiksberg', en: 'Frederiksberg', es: 'Frederiksberg', lat: [55.675, 55.690], lng: [12.520, 12.540] },
  { key: 'amager', en: 'Amager', es: 'Amager', lat: [55.640, 55.665], lng: [12.590, 12.608] },
  { key: 'nordhavn', en: 'Nordhavn', es: 'Nordhavn', lat: [55.710, 55.720], lng: [12.590, 12.604] },
  { key: 'christianshavn', en: 'Christianshavn', es: 'Christianshavn', lat: [55.670, 55.680], lng: [12.585, 12.600] },
  { key: 'valby', en: 'Valby', es: 'Valby', lat: [55.650, 55.670], lng: [12.500, 12.530] },
  { key: 'vanlose', en: 'Vanløse', es: 'Vanløse', lat: [55.680, 55.695], lng: [12.480, 12.510] },
] as const

// ─── Category configs ──────────────────────────────────────────────────────

const PROPERTY_SUBCATS = ['house', 'apartment', 'condo', 'land', 'office', 'commercial', 'warehouse'] as const
const VEHICLE_SUBCATS = ['car', 'motorcycle', 'bicycle', 'suv', 'commercial_vehicle', 'boat'] as const
const SERVICE_SUBCATS = ['home_repair', 'moving', 'cleaning', 'personal_care', 'tutoring', 'events', 'technology'] as const

const CAR_MAKES = [
  { make: 'Toyota', models: ['Corolla', 'Camry', 'RAV4', 'Yaris', 'Prius'] },
  { make: 'Volkswagen', models: ['Golf', 'Polo', 'Passat', 'Tiguan', 'ID.4'] },
  { make: 'BMW', models: ['3 Series', '5 Series', 'X3', 'X5', 'i4'] },
  { make: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'GLC', 'A-Class', 'EQC'] },
  { make: 'Audi', models: ['A3', 'A4', 'Q5', 'e-tron', 'A6'] },
  { make: 'Ford', models: ['Focus', 'Fiesta', 'Mustang Mach-E', 'Kuga', 'Puma'] },
  { make: 'Hyundai', models: ['i30', 'Tucson', 'Kona', 'Ioniq 5', 'i20'] },
  { make: 'Tesla', models: ['Model 3', 'Model Y', 'Model S', 'Model X'] },
  { make: 'Peugeot', models: ['208', '308', '3008', '508', 'e-208'] },
  { make: 'Volvo', models: ['XC40', 'XC60', 'V60', 'S60', 'EX30'] },
]

const MOTO_MAKES = [
  { make: 'Honda', models: ['CB500F', 'CBR650R', 'CRF300L', 'Rebel 500'] },
  { make: 'Yamaha', models: ['MT-07', 'R7', 'Tracer 7', 'XMAX 300'] },
  { make: 'BMW', models: ['R 1250 GS', 'F 900 R', 'S 1000 RR'] },
  { make: 'Ducati', models: ['Monster', 'Panigale V2', 'Scrambler'] },
  { make: 'KTM', models: ['390 Duke', '790 Adventure', 'RC 390'] },
]

const SERVICE_NAMES = {
  home_repair: { en: ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'HVAC Tech', 'General Handyman', 'Roofer', 'Locksmith'], es: ['Plomero', 'Electricista', 'Carpintero', 'Pintor', 'Técnico HVAC', 'Manitas', 'Techador', 'Cerrajero'] },
  moving: { en: ['Local Mover', 'Long-Distance Mover', 'Furniture Assembly', 'Packing Service'], es: ['Mudanza Local', 'Mudanza Larga Distancia', 'Ensamblaje Muebles', 'Servicio Empaque'] },
  cleaning: { en: ['Home Cleaner', 'Deep Cleaning', 'Office Cleaning', 'Window Washer', 'Carpet Cleaner'], es: ['Limpieza Hogar', 'Limpieza Profunda', 'Limpieza Oficina', 'Lavado Ventanas', 'Limpieza Alfombras'] },
  personal_care: { en: ['Hair Stylist', 'Massage Therapist', 'Personal Trainer', 'Nail Technician'], es: ['Estilista', 'Masajista', 'Entrenador Personal', 'Manicurista'] },
  tutoring: { en: ['Math Tutor', 'Language Teacher', 'Music Instructor', 'Science Tutor', 'Programming Coach'], es: ['Tutor Matemáticas', 'Profesor Idiomas', 'Instructor Música', 'Tutor Ciencias', 'Coach Programación'] },
  events: { en: ['Photographer', 'DJ', 'Caterer', 'Event Planner', 'Florist'], es: ['Fotógrafo', 'DJ', 'Catering', 'Organizador Eventos', 'Florista'] },
  technology: { en: ['IT Support', 'Web Developer', 'Network Setup', 'Data Recovery', 'Smart Home Setup'], es: ['Soporte IT', 'Desarrollador Web', 'Instalación Red', 'Recuperación Datos', 'Domótica'] },
}

const PROPERTY_FEATURES = ['pool', 'gym', 'parking', 'balcony', 'garden', 'elevator', 'security', 'laundry', 'storage', 'terrace', 'sauna', 'fireplace', 'air_conditioning', 'central_heating', 'dishwasher']
const VEHICLE_FEATURES = ['bluetooth', 'gps', 'leather_seats', 'sunroof', 'backup_camera', 'heated_seats', 'cruise_control', 'apple_carplay', 'android_auto', 'parking_sensors', 'keyless_entry', 'alloy_wheels']
const SERVICE_FEATURES = ['insured', 'certified', 'weekend_available', 'emergency_service', 'free_estimate', 'guaranteed', 'eco_friendly', 'same_day', 'online_booking', 'bilingual']

const UNSPLASH_IMAGES = {
  property: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  ],
  vehicle: [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-2f218e7bfa64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
  ],
  service: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&h=600&fit=crop',
  ],
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function randInt(min: number, max: number) { return Math.floor(rand(min, max + 1)) }
function pick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') }

function randomCoords(hood: typeof NEIGHBORHOODS[number]) {
  return {
    lat: rand(hood.lat[0], hood.lat[1]),
    lng: rand(hood.lng[0], hood.lng[1]),
  }
}

let slugCounter = 0
function uniqueSlug(base: string) {
  slugCounter++
  return `${slugify(base)}-${slugCounter}-${randomUUID().slice(0, 6)}`
}

// ─── Generators ────────────────────────────────────────────────────────────

function generateProperty(hood: typeof NEIGHBORHOODS[number]) {
  const subCat = pick(PROPERTY_SUBCATS)
  const txType = Math.random() < 0.5 ? 'buy' : 'rent' as const
  const { lat, lng } = randomCoords(hood)
  const bedrooms = subCat === 'land' ? null : randInt(1, 5)
  const bathrooms = subCat === 'land' ? null : randInt(1, 3)
  const area = subCat === 'land' ? randInt(200, 2000) : randInt(40, 250)
  const basePrice = txType === 'buy'
    ? (subCat === 'land' ? randInt(500000, 5000000) : area * randInt(20000, 50000))
    : randInt(5000, 30000)

  const titleEn = `${subCat === 'apartment' ? 'Modern' : subCat === 'house' ? 'Charming' : 'Spacious'} ${subCat} in ${hood.en}`
  const titleEs = `${subCat === 'apartment' ? 'Moderno' : subCat === 'house' ? 'Encantadora' : 'Espacioso'} ${subCat === 'apartment' ? 'apartamento' : subCat === 'house' ? 'casa' : subCat === 'condo' ? 'condominio' : subCat === 'land' ? 'terreno' : subCat === 'office' ? 'oficina' : 'local'} en ${hood.es}`

  return {
    listing: {
      id: randomUUID(),
      slug: uniqueSlug(`${subCat}-${hood.key}`),
      category: 'property' as const,
      subCategory: subCat,
      transactionType: txType,
      status: 'published' as const,
      price: basePrice,
      currency: 'DKK',
      pricePeriod: txType === 'rent' ? 'monthly' as const : 'one_time' as const,
      latitude: lat,
      longitude: lng,
      addressLine1: `${hood.en} ${randInt(1, 200)}`,
      city: 'Copenhagen',
      country: 'DK',
      featured: Math.random() < 0.05,
      publishedAt: new Date(),
    },
    extension: {
      bedrooms,
      bathrooms,
      areaSqm: area,
      lotSqm: subCat === 'land' || subCat === 'house' ? randInt(100, 800) : null,
      yearBuilt: randInt(1900, 2024),
      parkingSpaces: Math.random() < 0.4 ? randInt(1, 3) : null,
      floors: subCat === 'apartment' ? randInt(1, 6) : null,
      furnished: Math.random() < 0.3,
    },
    translations: { en: { title: titleEn, summary: `Beautiful ${subCat} located in ${hood.en}, Copenhagen.`, description: `This ${subCat} offers ${bedrooms ?? 0} bedrooms, ${bathrooms ?? 0} bathrooms, and ${area} m² of space.`, neighborhood: hood.en }, es: { title: titleEs, summary: `Hermoso ${subCat} ubicado en ${hood.es}, Copenhague.`, description: `Este inmueble ofrece ${bedrooms ?? 0} habitaciones, ${bathrooms ?? 0} baños y ${area} m² de espacio.`, neighborhood: hood.es } },
    images: pickN(UNSPLASH_IMAGES.property, randInt(3, 5)),
    features: pickN(PROPERTY_FEATURES, randInt(3, 7)),
  }
}

function generateVehicle(hood: typeof NEIGHBORHOODS[number]) {
  const subCat = pick(VEHICLE_SUBCATS)
  const txType = Math.random() < 0.6 ? 'buy' : 'rent' as const
  const { lat, lng } = randomCoords(hood)

  let make: string, model: string
  if (subCat === 'motorcycle') {
    const m = pick(MOTO_MAKES)
    make = m.make; model = pick(m.models)
  } else if (subCat === 'bicycle') {
    make = pick(['Trek', 'Giant', 'Specialized', 'Cannondale', 'Bianchi'])
    model = pick(['City Bike', 'Road Bike', 'Mountain Bike', 'E-Bike', 'Gravel Bike'])
  } else {
    const m = pick(CAR_MAKES)
    make = m.make; model = pick(m.models)
  }

  const year = randInt(2010, 2025)
  const mileage = subCat === 'bicycle' ? randInt(100, 10000) : randInt(1000, 150000)
  const fuelType = subCat === 'bicycle' ? null : pick(['gasoline', 'diesel', 'electric', 'hybrid'] as const)
  const transmission = subCat === 'bicycle' || subCat === 'motorcycle' ? null : pick(['manual', 'automatic'] as const)
  const basePrice = txType === 'buy'
    ? (subCat === 'bicycle' ? randInt(2000, 30000) : subCat === 'motorcycle' ? randInt(15000, 150000) : randInt(50000, 800000))
    : (subCat === 'bicycle' ? randInt(50, 300) : randInt(500, 5000))

  const titleEn = `${year} ${make} ${model}`
  const titleEs = `${year} ${make} ${model}`

  return {
    listing: {
      id: randomUUID(),
      slug: uniqueSlug(`${make}-${model}`),
      category: 'vehicle' as const,
      subCategory: subCat,
      transactionType: txType,
      status: 'published' as const,
      price: basePrice,
      currency: 'DKK',
      pricePeriod: txType === 'rent' ? 'daily' as const : 'one_time' as const,
      latitude: lat,
      longitude: lng,
      addressLine1: `${hood.en} Dealer ${randInt(1, 50)}`,
      city: 'Copenhagen',
      country: 'DK',
      featured: Math.random() < 0.05,
      publishedAt: new Date(),
    },
    extension: {
      make,
      model,
      year,
      mileageKm: mileage,
      fuelType,
      transmission,
      color: pick(['Black', 'White', 'Silver', 'Blue', 'Red', 'Grey', 'Green']),
      engineDisplacementCc: subCat === 'bicycle' ? null : randInt(1000, 5000),
      doors: subCat === 'car' || subCat === 'suv' ? pick([2, 4, 5]) : null,
    },
    translations: { en: { title: titleEn, summary: `${year} ${make} ${model} with ${mileage.toLocaleString()} km.`, description: `Well-maintained ${make} ${model} from ${year}. ${fuelType ? `Fuel: ${fuelType}.` : ''} ${transmission ? `Transmission: ${transmission}.` : ''} Located in ${hood.en}.`, neighborhood: hood.en }, es: { title: titleEs, summary: `${year} ${make} ${model} con ${mileage.toLocaleString()} km.`, description: `${make} ${model} de ${year} bien cuidado. ${fuelType ? `Combustible: ${fuelType}.` : ''} ${transmission ? `Transmisión: ${transmission}.` : ''} Ubicado en ${hood.es}.`, neighborhood: hood.es } },
    images: pickN(UNSPLASH_IMAGES.vehicle, randInt(3, 5)),
    features: pickN(VEHICLE_FEATURES, randInt(3, 6)),
  }
}

function generateService(hood: typeof NEIGHBORHOODS[number]) {
  const subCat = pick(SERVICE_SUBCATS)
  const { lat, lng } = randomCoords(hood)
  const names = SERVICE_NAMES[subCat]
  const nameIdx = randInt(0, names.en.length - 1)
  const basePrice = randInt(100, 2000)

  return {
    listing: {
      id: randomUUID(),
      slug: uniqueSlug(`${subCat}-${hood.key}`),
      category: 'service' as const,
      subCategory: subCat,
      transactionType: 'hire' as const,
      status: 'published' as const,
      price: basePrice,
      currency: 'DKK',
      pricePeriod: 'hourly' as const,
      latitude: lat,
      longitude: lng,
      addressLine1: `${hood.en} Area`,
      city: 'Copenhagen',
      country: 'DK',
      featured: Math.random() < 0.05,
      publishedAt: new Date(),
    },
    extension: {
      serviceRadiusKm: randInt(2, 20),
      availability: { weekdays: true, weekends: Math.random() < 0.6, hours: `${randInt(7, 10)}:00-${randInt(17, 21)}:00` },
      experienceYears: randInt(1, 25),
      certifications: Math.random() < 0.5 ? `Certified ${subCat} professional` : null,
      responseTime: pick(['< 1 hour', '1-2 hours', 'Same day', 'Within 24 hours']),
    },
    translations: { en: { title: `${names.en[nameIdx]} in ${hood.en}`, summary: `Professional ${names.en[nameIdx].toLowerCase()} service in ${hood.en}, Copenhagen.`, description: `Experienced ${names.en[nameIdx].toLowerCase()} offering quality services in the ${hood.en} area. Reliable, fast, and professional.`, neighborhood: hood.en }, es: { title: `${names.es[nameIdx]} en ${hood.es}`, summary: `Servicio profesional de ${names.es[nameIdx].toLowerCase()} en ${hood.es}, Copenhague.`, description: `${names.es[nameIdx]} con experiencia ofreciendo servicios de calidad en la zona de ${hood.es}. Confiable, rápido y profesional.`, neighborhood: hood.es } },
    images: pickN(UNSPLASH_IMAGES.service, randInt(2, 4)),
    features: pickN(SERVICE_FEATURES, randInt(3, 6)),
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding multi-category listings...')

  // Clear v2 tables
  await db.execute(sql`TRUNCATE listing_features, listing_assets, listing_translations, listing_services, listing_vehicles, listing_properties, listings CASCADE`)
  console.log('  ✓ Cleared existing v2 data')

  const BATCH_SIZE = 500
  const TOTAL_PER_CATEGORY = 5000

  for (const [catName, generator] of [
    ['property', generateProperty],
    ['vehicle', generateVehicle],
    ['service', generateService],
  ] as const) {
    console.log(`\n📦 Seeding ${TOTAL_PER_CATEGORY} ${catName} listings...`)
    let created = 0

    while (created < TOTAL_PER_CATEGORY) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL_PER_CATEGORY - created)
      const batchListings: any[] = []
      const batchExtensions: any[] = []
      const batchTranslations: any[] = []
      const batchAssets: any[] = []
      const batchFeatures: any[] = []

      for (let i = 0; i < batchSize; i++) {
        const hood = pick(NEIGHBORHOODS)
        const item = generator(hood)

        batchListings.push(item.listing)
        batchExtensions.push({ listingId: item.listing.id, ...item.extension })

        for (const locale of ['en', 'es'] as const) {
          batchTranslations.push({
            listingId: item.listing.id,
            locale,
            ...item.translations[locale],
          })
        }

        item.images.forEach((url, idx) => {
          batchAssets.push({
            listingId: item.listing.id,
            kind: 'image' as const,
            url,
            sortOrder: idx,
            isCover: idx === 0,
          })
        })

        item.features.forEach((code) => {
          batchFeatures.push({
            listingId: item.listing.id,
            featureCode: code,
          })
        })
      }

      await db.insert(listings).values(batchListings)

      if (catName === 'property') {
        await db.insert(listingProperties).values(batchExtensions)
      } else if (catName === 'vehicle') {
        await db.insert(listingVehicles).values(batchExtensions)
      } else {
        await db.insert(listingServices).values(batchExtensions)
      }

      await db.insert(listingTranslations).values(batchTranslations)
      await db.insert(listingAssets).values(batchAssets)
      await db.insert(listingFeatures).values(batchFeatures)

      created += batchSize
      process.stdout.write(`  ${created}/${TOTAL_PER_CATEGORY}\r`)
    }

    console.log(`  ✓ ${TOTAL_PER_CATEGORY} ${catName} listings created`)
  }

  console.log('\n✅ Seed complete — 15,000 multi-category listings')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
