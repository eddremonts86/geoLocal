import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { randomUUID } from 'node:crypto'
import { sql } from 'drizzle-orm'
import {
  properties,
  propertyTranslations,
  propertyAssets,
  propertyFeatures,
} from '../../src/shared/lib/db/schema'

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5434/geo_dashboard'

const client = postgres(DATABASE_URL, { prepare: false })
const db = drizzle(client)

// ─── Copenhagen Neighborhoods with realistic bounding boxes ────────────────

interface Neighborhood {
  key: string
  en: string
  es: string
  lat: [number, number]
  lng: [number, number]
  priceMultiplier: number
  rentWeight: number
  typeWeights: { apartment: number; house: number; condo: number; land: number }
  streets: string[]
  yearRange: [number, number]
  maxFloor: number
  description: { en: string; es: string }
}

const NEIGHBORHOODS: Neighborhood[] = [
  {
    key: 'indre-by',
    en: 'Indre By (City Center)',
    es: 'Indre By (Centro)',
    lat: [55.675, 55.684],
    lng: [12.566, 12.583],
    priceMultiplier: 1.8,
    rentWeight: 0.55,
    typeWeights: { apartment: 0.75, house: 0.05, condo: 0.2, land: 0 },
    streets: ['Strøget', 'Gothersgade', 'Nyhavn', 'Bredgade', 'Store Kongensgade', 'Pilestræde', 'Købmagergade', 'Vimmelskaftet', 'Ny Østergade', 'Grønnegade', 'Kronprinsessegade', 'Landemærket'],
    yearRange: [1750, 2024],
    maxFloor: 7,
    description: { en: 'In the heart of Copenhagen with historic charm, cobblestone streets, and proximity to Nyhavn, Kongens Nytorv and the Royal Palace.', es: 'En el corazón de Copenhague con encanto histórico, calles adoquinadas y proximidad a Nyhavn, Kongens Nytorv y el Palacio Real.' },
  },
  {
    key: 'norrebro',
    en: 'Nørrebro',
    es: 'Nørrebro',
    lat: [55.688, 55.706],
    lng: [12.535, 12.565],
    priceMultiplier: 0.85,
    rentWeight: 0.65,
    typeWeights: { apartment: 0.8, house: 0.08, condo: 0.12, land: 0 },
    streets: ['Nørrebrogade', 'Jægersborggade', 'Blågårdsgade', 'Griffenfeldsgade', 'Ravnsborggade', 'Elmegade', 'Stefansgade', 'Sankt Hans Gade', 'Møllegade', 'Thorsgade', 'Baldersgade', 'Heimdalsgade'],
    yearRange: [1870, 2024],
    maxFloor: 6,
    description: { en: 'Vibrant multicultural neighborhood with trendy shops, street food, and a bohemian atmosphere along Jægersborggade.', es: 'Vibrante barrio multicultural con tiendas de moda, comida callejera y atmósfera bohemia a lo largo de Jægersborggade.' },
  },
  {
    key: 'vesterbro',
    en: 'Vesterbro',
    es: 'Vesterbro',
    lat: [55.667, 55.677],
    lng: [12.545, 12.565],
    priceMultiplier: 1.05,
    rentWeight: 0.6,
    typeWeights: { apartment: 0.82, house: 0.03, condo: 0.15, land: 0 },
    streets: ['Istedgade', 'Vesterbrogade', 'Værnedamsvej', 'Enghavevej', 'Sønder Boulevard', 'Skydebanegade', 'Halmtorvet', 'Absalonsgade', 'Viktoriagade', 'Gasværksvej', 'Matthæusgade', 'Dannebrogsgade'],
    yearRange: [1880, 2024],
    maxFloor: 7,
    description: { en: 'Trendy district with craft beer bars, gourmet restaurants, the Meatpacking District, and proximity to Tivoli Gardens.', es: 'Distrito de moda con bares artesanales, restaurantes gourmet, el Barrio de la Carne y proximidad a los Jardines Tivoli.' },
  },
  {
    key: 'osterbro',
    en: 'Østerbro',
    es: 'Østerbro',
    lat: [55.692, 55.712],
    lng: [12.565, 12.590],
    priceMultiplier: 1.35,
    rentWeight: 0.45,
    typeWeights: { apartment: 0.65, house: 0.15, condo: 0.2, land: 0 },
    streets: ['Østerbrogade', 'Nordre Frihavnsgade', 'Classensgade', 'Strandboulevarden', 'Dag Hammarskjölds Allé', 'Svanemøllevej', 'Vennemindevej', 'Viborggade', 'Nøjsomhedsvej', 'Marstalsgade', 'Blegdamsvej', 'Rosenvængets Allé'],
    yearRange: [1890, 2024],
    maxFloor: 6,
    description: { en: 'Upscale residential area with leafy boulevards, Fælledparken, cafés, and proximity to the waterfront and Kastellet.', es: 'Zona residencial de alto nivel con bulevares arbolados, Fælledparken, cafés y proximidad al paseo marítimo y Kastellet.' },
  },
  {
    key: 'frederiksberg',
    en: 'Frederiksberg',
    es: 'Frederiksberg',
    lat: [55.672, 55.690],
    lng: [12.515, 12.545],
    priceMultiplier: 1.4,
    rentWeight: 0.4,
    typeWeights: { apartment: 0.6, house: 0.2, condo: 0.2, land: 0 },
    streets: ['Gammel Kongevej', 'Falkoner Allé', 'Smallegade', 'Godthåbsvej', 'Frederiksberg Allé', 'Vodroffsvej', 'Howitzvej', 'Platanvej', 'H.C. Ørsteds Vej', 'Rolighedsvej', 'Grundtvigsvej', 'Thorvaldsensvej'],
    yearRange: [1850, 2024],
    maxFloor: 6,
    description: { en: 'Elegant municipality with Frederiksberg Gardens, Copenhagen Zoo, and a sophisticated village atmosphere.', es: 'Elegante municipio con los Jardines Frederiksberg, el Zoo de Copenhague y una sofisticada atmósfera de pueblo.' },
  },
  {
    key: 'amager',
    en: 'Amager (Amagerbro)',
    es: 'Amager (Amagerbro)',
    lat: [55.652, 55.668],
    lng: [12.590, 12.608],
    priceMultiplier: 0.75,
    rentWeight: 0.6,
    typeWeights: { apartment: 0.7, house: 0.1, condo: 0.15, land: 0.05 },
    streets: ['Amagerbrogade', 'Amager Strandvej', 'Holmbladsgade', 'Englandsvej', 'Sundholmsvej', 'Vermlandsgade', 'Italiensvej', 'Krimsvej', 'Prags Boulevard', 'Øresundsvej', 'Lergravsvej', 'Amagerfælledvej'],
    yearRange: [1920, 2024],
    maxFloor: 8,
    description: { en: 'Up-and-coming district with Amager Strand beach, CopenHill, and a mix of classic and modern architecture.', es: 'Distrito en auge con la playa Amager Strand, CopenHill y una mezcla de arquitectura clásica y moderna.' },
  },
  {
    key: 'christianshavn',
    en: 'Christianshavn',
    es: 'Christianshavn',
    lat: [55.671, 55.679],
    lng: [12.586, 12.600],
    priceMultiplier: 1.25,
    rentWeight: 0.5,
    typeWeights: { apartment: 0.7, house: 0.15, condo: 0.15, land: 0 },
    streets: ['Torvegade', 'Overgaden oven Vandet', 'Overgaden neden Vandet', 'Prinsessegade', 'Sankt Annæ Gade', 'Wildersgade', 'Strandgade', 'Bådsmandsstræde', 'Dronningensgade', 'Sofiegade'],
    yearRange: [1620, 2024],
    maxFloor: 5,
    description: { en: 'Charming canal district with colorful houseboats, Christiania, Our Saviour\'s Church spire, and a relaxed waterfront lifestyle.', es: 'Encantador distrito de canales con casas flotantes coloridas, Christiania, la aguja de la Iglesia del Salvador y un estilo de vida relajado.' },
  },
  {
    key: 'nordhavn',
    en: 'Nordhavn',
    es: 'Nordhavn',
    lat: [55.706, 55.716],
    lng: [12.590, 12.604],
    priceMultiplier: 1.55,
    rentWeight: 0.45,
    typeWeights: { apartment: 0.6, house: 0.05, condo: 0.35, land: 0 },
    streets: ['Århusgade', 'Sundkaj', 'Sandkaj', 'Orientkaj', 'Fortkaj', 'Redmolen', 'Dampfærgevej', 'Helsinkigade', 'Göteborgsgade', 'Trondhjemsgade', 'Borgmester Jensens Allé'],
    yearRange: [2015, 2026],
    maxFloor: 12,
    description: { en: 'Copenhagen\'s newest waterfront district with cutting-edge Scandinavian architecture, harbor baths, and sustainable urban design.', es: 'El distrito costero más nuevo con arquitectura escandinava de vanguardia, baños portuarios y diseño urbano sostenible.' },
  },
  {
    key: 'sydhavn',
    en: 'Sydhavn (South Harbour)',
    es: 'Sydhavn (Puerto Sur)',
    lat: [55.644, 55.658],
    lng: [12.538, 12.556],
    priceMultiplier: 0.7,
    rentWeight: 0.65,
    typeWeights: { apartment: 0.65, house: 0.1, condo: 0.2, land: 0.05 },
    streets: ['Sydhavnsgade', 'Borgbjergsvej', 'Mozarts Plads', 'Scandiagade', 'Vestre Teglgade', 'Karens Minde Allé', 'Ellebjergvej', 'Sjælør Boulevard', 'Alfred Christensens Vej'],
    yearRange: [1950, 2026],
    maxFloor: 10,
    description: { en: 'Rapidly developing harbor area with new residential projects, green spaces, and kayak channels.', es: 'Zona portuaria en rápido desarrollo con nuevos proyectos residenciales y espacios verdes.' },
  },
  {
    key: 'valby',
    en: 'Valby',
    es: 'Valby',
    lat: [55.652, 55.672],
    lng: [12.495, 12.530],
    priceMultiplier: 0.7,
    rentWeight: 0.55,
    typeWeights: { apartment: 0.55, house: 0.25, condo: 0.15, land: 0.05 },
    streets: ['Valby Langgade', 'Toftegårds Allé', 'Vigerslev Allé', 'Valby Tingsted', 'Carl Jacobsens Vej', 'Gl. Køge Landevej', 'Søndre Fasanvej', 'Moltkesvej', 'Hornemansgade', 'Vigerslevvej'],
    yearRange: [1900, 2024],
    maxFloor: 5,
    description: { en: 'Family-friendly neighborhood with Carlsberg Byen, parks, and good schools on the western edge.', es: 'Barrio familiar con Carlsberg Byen, parques y buenas escuelas en el borde occidental.' },
  },
  {
    key: 'carlsberg-byen',
    en: 'Carlsberg Byen',
    es: 'Carlsberg Byen',
    lat: [55.662, 55.670],
    lng: [12.530, 12.545],
    priceMultiplier: 1.3,
    rentWeight: 0.5,
    typeWeights: { apartment: 0.5, house: 0.05, condo: 0.45, land: 0 },
    streets: ['Ny Carlsberg Vej', 'Pasteursvej', 'Tapperitorvet', 'Rahbeks Allé', 'Bryggernes Plads', 'Humleby', 'J.C. Jacobsens Gade', 'Ottilia Jacobsens Plads'],
    yearRange: [2010, 2026],
    maxFloor: 10,
    description: { en: 'Former Carlsberg brewery site transformed into a vibrant mixed-use neighborhood with world-class architecture.', es: 'Antigua cervecería Carlsberg transformada en un vibrante barrio con arquitectura de clase mundial.' },
  },
  {
    key: 'hellerup',
    en: 'Hellerup',
    es: 'Hellerup',
    lat: [55.726, 55.738],
    lng: [12.568, 12.585],
    priceMultiplier: 1.9,
    rentWeight: 0.3,
    typeWeights: { apartment: 0.35, house: 0.45, condo: 0.2, land: 0 },
    streets: ['Strandvejen', 'Tuborg Havnevej', 'Ryvangs Allé', 'Bernstorffsvej', 'Callisensvej', 'Duntzfelts Allé', 'Hellerupvej', 'Onsgårdsvej', 'Grønnevænge Allé', 'Tuborgvej'],
    yearRange: [1880, 2024],
    maxFloor: 5,
    description: { en: 'Copenhagen\'s most prestigious suburb with waterfront villas, Tuborg Havn, and international schools.', es: 'El suburbio más prestigioso con villas frente al mar, Tuborg Havn y escuelas internacionales.' },
  },
  {
    key: 'islands-brygge',
    en: 'Islands Brygge',
    es: 'Islands Brygge',
    lat: [55.657, 55.667],
    lng: [12.575, 12.590],
    priceMultiplier: 1.15,
    rentWeight: 0.5,
    typeWeights: { apartment: 0.7, house: 0.05, condo: 0.25, land: 0 },
    streets: ['Islands Brygge', 'Artillerivej', 'Njalsgade', 'Egilsgade', 'Thorshavnsgade', 'Leifsgade', 'Gunløgsgade', 'Halfdansgade', 'Isafjordsgade'],
    yearRange: [1930, 2024],
    maxFloor: 8,
    description: { en: 'Popular waterfront area with the famous harbor bath, Havneparken, and stunning harbor views.', es: 'Popular zona frente al agua con el famoso baño portuario, Havneparken y vistas impresionantes al puerto.' },
  },
  {
    key: 'kongens-lyngby',
    en: 'Kongens Lyngby',
    es: 'Kongens Lyngby',
    lat: [55.765, 55.785],
    lng: [12.490, 12.520],
    priceMultiplier: 1.1,
    rentWeight: 0.5,
    typeWeights: { apartment: 0.4, house: 0.4, condo: 0.15, land: 0.05 },
    streets: ['Lyngby Hovedgade', 'Lundtoftevej', 'Nørgaardsvej', 'Buddingevej', 'Sorgenfrivej', 'Kanalvej', 'Firskovvej', 'Akademivej', 'Ulrikkenborg Allé'],
    yearRange: [1920, 2024],
    maxFloor: 6,
    description: { en: 'University town north of Copenhagen with DTU campus, Lyngby Sø lake, and suburban tranquility.', es: 'Ciudad universitaria al norte de Copenhague con DTU, el lago Lyngby Sø y tranquilidad suburbana.' },
  },
  {
    key: 'vanlose',
    en: 'Vanløse',
    es: 'Vanløse',
    lat: [55.682, 55.696],
    lng: [12.480, 12.510],
    priceMultiplier: 0.8,
    rentWeight: 0.55,
    typeWeights: { apartment: 0.5, house: 0.3, condo: 0.15, land: 0.05 },
    streets: ['Vanløse Allé', 'Jernbane Allé', 'Ålekistevej', 'Apollovej', 'Hermodsgade', 'Jyllingevej', 'Indertoften', 'Roskildevej', 'Fleur Allé'],
    yearRange: [1930, 2024],
    maxFloor: 5,
    description: { en: 'Quiet residential suburb connected by metro, with parks, Damhussøen lake, and a strong community feel.', es: 'Tranquilo suburbio residencial conectado por metro, con parques y fuerte sentido comunitario.' },
  },
]

// ─── Realistic Unsplash photos ─────────────────────────────────────────────────

const APARTMENT_IMAGES = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop',
]

const HOUSE_IMAGES = [
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop',
]

const CONDO_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=600&fit=crop',
]

const LAND_IMAGES = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
]

const INTERIOR_IMAGES = [
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1565182999561-18d7dc47c393?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&h=600&fit=crop',
]

const IMAGE_MAP: Record<string, string[]> = {
  apartment: APARTMENT_IMAGES,
  house: HOUSE_IMAGES,
  condo: CONDO_IMAGES,
  land: LAND_IMAGES,
}

// ─── Features ──────────────────────────────────────────────────────────────────

const FEATURES_POOL = [
  'elevator', 'balcony', 'terrace', 'garden', 'parking', 'bike_storage',
  'laundry', 'dishwasher', 'furnished', 'pet_friendly', 'heating',
  'floor_heating', 'fireplace', 'storage', 'gym', 'sauna',
  'rooftop_access', 'concierge', 'ev_charging', 'solar_panels',
  'smart_home', 'double_glazing', 'courtyard', 'harbor_view',
]

// ─── Price ranges (DKK) ────────────────────────────────────────────────────────

const PRICE_RANGES = {
  rent: {
    apartment: { min: 7000, max: 28000 },
    house: { min: 15000, max: 45000 },
    condo: { min: 9000, max: 35000 },
    land: { min: 3000, max: 8000 },
  },
  sale: {
    apartment: { min: 1500000, max: 8500000 },
    house: { min: 3000000, max: 18000000 },
    condo: { min: 2000000, max: 12000000 },
    land: { min: 800000, max: 6000000 },
  },
}

const AREA_RANGES: Record<string, { min: number; max: number }> = {
  apartment: { min: 28, max: 180 },
  house: { min: 90, max: 350 },
  condo: { min: 45, max: 200 },
  land: { min: 200, max: 2000 },
}

// ─── Title / summary templates ─────────────────────────────────────────────────

const EN_ADJ = ['Charming', 'Modern', 'Bright', 'Spacious', 'Cozy', 'Elegant', 'Renovated', 'Stylish', 'Stunning', 'Beautiful', 'Lovely', 'Luxurious', 'Minimalist', 'Sleek', 'Contemporary', 'Classic', 'Nordic', 'Inviting', 'Sunny', 'Quiet']
const ES_ADJ = ['Encantador', 'Moderno', 'Luminoso', 'Espacioso', 'Acogedor', 'Elegante', 'Renovado', 'Con estilo', 'Impresionante', 'Hermoso', 'Precioso', 'Lujoso', 'Minimalista', 'Sofisticado', 'Contemporáneo', 'Clásico', 'Nórdico', 'Atractivo', 'Soleado', 'Tranquilo']

const EN_TYPE: Record<string, string> = { apartment: 'Apartment', house: 'House', condo: 'Condo', land: 'Land Plot' }
const ES_TYPE: Record<string, string> = { apartment: 'Apartamento', house: 'Casa', condo: 'Condominio', land: 'Terreno' }

const EN_SUM_RENT = [
  'Available for immediate move-in with flexible lease terms',
  'Perfect rental in a prime location with great public transport',
  'Fully equipped rental with modern Scandinavian interiors',
  'Bright and airy space ideal for professionals or couples',
  'Recently renovated with high-end finishes throughout',
  'Turnkey rental with panoramic views and natural light',
  'Well-maintained unit in a quiet, sought-after building',
  'Comfortable living space steps from shops and restaurants',
]
const EN_SUM_SALE = [
  'Excellent investment opportunity in a growing neighborhood',
  'Move-in ready with premium finishes and smart home features',
  'Rare find in one of Copenhagen\'s most desirable areas',
  'Beautifully maintained property with strong rental potential',
  'Premium location with easy access to metro and amenities',
  'Architecturally distinctive home with period details preserved',
  'Newly built with energy-efficient design and harbor proximity',
  'Exceptional quality construction with designer kitchen and bath',
]
const ES_SUM_RENT = [
  'Disponible para mudanza inmediata con contrato flexible',
  'Alquiler perfecto en ubicación premium con transporte público',
  'Totalmente equipado con interiores escandinavos modernos',
  'Espacio luminoso ideal para profesionales o parejas',
  'Recientemente renovado con acabados de alta gama',
  'Alquiler listo con vistas panorámicas y luz natural',
  'Unidad bien mantenida en edificio tranquilo y codiciado',
  'Espacio cómodo a pasos de tiendas y restaurantes',
]
const ES_SUM_SALE = [
  'Excelente oportunidad de inversión en barrio en crecimiento',
  'Listo para mudarse con acabados premium y domótica',
  'Hallazgo único en una de las zonas más deseadas de Copenhague',
  'Propiedad bien mantenida con alto potencial de alquiler',
  'Ubicación premium con fácil acceso al metro y servicios',
  'Hogar distintivo con detalles de época preservados',
  'Nueva construcción con diseño eficiente y proximidad al puerto',
  'Calidad excepcional con cocina y baño de diseñador',
]

const EN_DESC = [
  'This property offers a wonderful balance of comfort and style in one of Copenhagen\'s most sought-after neighborhoods. The living area features high ceilings, original hardwood floors, and large windows that flood the space with natural Scandinavian light. The kitchen has been recently updated with modern appliances while maintaining the building\'s historic character. Excellent public transport connections with bus and metro within walking distance.',
  'Welcome to this beautifully presented home that showcases the best of Danish design. The open-plan living and dining area creates a generous entertaining space, while the bedrooms offer peaceful retreats. The building features a charming courtyard garden shared with neighbors, creating a true sense of community. Located close to local cafés, organic grocers, and green spaces.',
  'A rare opportunity in this highly desirable location. This property has been thoughtfully renovated to combine period features with contemporary comfort. The bathroom features heated floors and designer fixtures. A private balcony overlooks the tree-lined street below. Storage room and bike parking in the basement. Low monthly expenses and a well-run housing association.',
  'Step into this light-filled space where Scandinavian minimalism meets warm, livable design. The efficient layout maximizes every square meter, with built-in storage throughout. The kitchen features integrated appliances and a breakfast bar perfect for morning coffee. The building was recently renovated with new roof, windows, and common areas. Walking distance to parks, schools, and shopping.',
  'This impressive property sits in a landmark building with a stunning facade. Inside, you\'ll find generous room proportions, ornate ceiling moldings, and the classic Copenhagen stucco work that defines the neighborhood. Modern updates include a sleek kitchen with stone countertops, updated electrical systems, and fiber internet. The location offers the perfect blend of urban energy and residential calm.',
]
const ES_DESC = [
  'Esta propiedad ofrece un equilibrio entre comodidad y estilo en uno de los barrios más codiciados de Copenhague. La sala presenta techos altos, pisos de madera originales y grandes ventanas que inundan el espacio con luz escandinava. La cocina fue actualizada con electrodomésticos modernos manteniendo el carácter histórico. Excelentes conexiones de transporte público con bus y metro a poca distancia.',
  'Bienvenido a este hogar que muestra lo mejor del diseño danés. La sala de estar y comedor de concepto abierto crea un generoso espacio, mientras los dormitorios ofrecen retiros tranquilos. El edificio cuenta con un encantador jardín interior compartido con vecinos. Ubicado cerca de cafés locales, tiendas orgánicas y espacios verdes.',
  'Una oportunidad única en esta ubicación altamente deseable. La propiedad fue renovada cuidadosamente para combinar características de época con comodidad contemporánea. El baño cuenta con suelo radiante y accesorios de diseñador. Un balcón privado da a la calle arbolada. Trastero y aparcamiento para bicicletas en el sótano.',
  'Entre en este espacio lleno de luz donde el minimalismo escandinavo se encuentra con un diseño cálido. La distribución eficiente maximiza cada metro cuadrado con almacenamiento integrado. La cocina cuenta con electrodomésticos integrados y barra de desayuno. El edificio fue renovado recientemente. A poca distancia de parques, escuelas y tiendas.',
  'Esta impresionante propiedad se encuentra en un edificio emblemático con fachada espectacular. En el interior encontrará proporciones generosas, molduras ornamentales y el clásico estuco de Copenhague. Actualizaciones modernas incluyen cocina elegante con encimeras de piedra, sistemas eléctricos actualizados e internet de fibra.',
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function rand(min: number, max: number) { return min + Math.random() * (max - min) }
function randInt(min: number, max: number) { return Math.floor(rand(min, max + 1)) }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]! }

function pickWeighted(weights: Record<string, number>): string {
  const entries = Object.entries(weights)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = Math.random() * total
  for (const [key, weight] of entries) {
    r -= weight
    if (r <= 0) return key
  }
  return entries[0]![0]
}

function slugify(str: string): string {
  return str.toLowerCase()
    .replace(/[æ]/g, 'ae').replace(/[ø]/g, 'oe').replace(/[å]/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function roundPrice(price: number, listing: string): number {
  if (listing === 'rent') return Math.round(price / 100) * 100
  return Math.round(price / 50000) * 50000
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const TOTAL = 15_000
const BATCH_SIZE = 500

async function seed() {
  console.log(`🌱 Seeding ${TOTAL.toLocaleString()} Copenhagen properties...\n`)

  // Clear existing data
  await db.delete(properties)
  console.log('  🗑️  Cleared existing properties\n')

  let count = 0
  const usedSlugs = new Set<string>()

  let propBatch: (typeof properties.$inferInsert)[] = []
  let transBatch: (typeof propertyTranslations.$inferInsert)[] = []
  let assetBatch: (typeof propertyAssets.$inferInsert)[] = []
  let featureBatch: (typeof propertyFeatures.$inferInsert)[] = []

  for (let i = 0; i < TOTAL; i++) {
    const hood = pick(NEIGHBORHOODS)
    const pType = pickWeighted(hood.typeWeights) as 'apartment' | 'house' | 'condo' | 'land'
    const listing = (Math.random() < hood.rentWeight ? 'rent' : 'sale') as 'rent' | 'sale'

    const lat = rand(hood.lat[0], hood.lat[1])
    const lng = rand(hood.lng[0], hood.lng[1])

    const range = PRICE_RANGES[listing][pType]
    const price = roundPrice(rand(range.min, range.max) * hood.priceMultiplier, listing)

    const areaR = AREA_RANGES[pType]!
    const area = pType === 'land' ? null : randInt(areaR.min, areaR.max)
    const lot = pType === 'land' ? randInt(areaR.min, areaR.max) : (pType === 'house' ? randInt(80, 600) : null)

    const beds = pType === 'land' ? null : (area && area < 40 ? 0 : randInt(1, Math.min(6, Math.floor((area ?? 80) / 30))))
    const baths = pType === 'land' ? null : Math.max(1, randInt(1, Math.min(4, (beds ?? 0) + 1)))

    const floor = (pType === 'apartment' || pType === 'condo') ? randInt(0, hood.maxFloor) : null
    const year = randInt(hood.yearRange[0], hood.yearRange[1])

    const street = pick(hood.streets)
    const houseNum = randInt(1, 200)
    const addr = `${street} ${houseNum}`

    const adjIdx = randInt(0, EN_ADJ.length - 1)
    const enAdj = EN_ADJ[adjIdx]!
    const esAdj = ES_ADJ[adjIdx]!

    const baseSlug = slugify(`${enAdj}-${EN_TYPE[pType]}-${street}-${houseNum}`)
    let slug = baseSlug
    let sfx = 2
    while (usedSlugs.has(slug)) { slug = `${baseSlug}-${sfx}`; sfx++ }
    usedSlugs.add(slug)

    const id = randomUUID()

    propBatch.push({
      id, slug, listingType: listing, propertyType: pType, status: 'published',
      price, currency: 'DKK', bedrooms: beds, bathrooms: baths,
      areaM2: area, lotM2: lot,
      parkingSpaces: pType === 'land' ? null : (Math.random() > 0.7 ? randInt(1, 2) : 0),
      floorNumber: floor, yearBuilt: year,
      latitude: lat, longitude: lng, addressLine1: addr,
      city: 'København', region: hood.en, country: 'DK',
      featured: Math.random() > 0.92,
      publishedAt: new Date(Date.now() - randInt(0, 180) * 86400000),
    })

    const bedsEn = beds === 0 ? 'studio' : beds === null ? '' : `${beds}-bed`
    const bedsEs = beds === 0 ? 'estudio' : beds === null ? '' : `${beds} hab.`
    const enTitle = `${enAdj} ${bedsEn ? bedsEn + ' ' : ''}${EN_TYPE[pType]} on ${street}`
    const esTitle = `${esAdj} ${ES_TYPE[pType]}${bedsEs ? ' de ' + bedsEs : ''} en ${street}`
    const sums = listing === 'rent' ? { en: pick(EN_SUM_RENT), es: pick(ES_SUM_RENT) } : { en: pick(EN_SUM_SALE), es: pick(ES_SUM_SALE) }

    transBatch.push({ propertyId: id, locale: 'en', title: enTitle, summary: sums.en, description: pick(EN_DESC), neighborhood: hood.en })
    transBatch.push({ propertyId: id, locale: 'es', title: esTitle, summary: sums.es, description: pick(ES_DESC), neighborhood: hood.es })

    const typeImgs = IMAGE_MAP[pType]!
    assetBatch.push({ propertyId: id, kind: 'image', url: pick(typeImgs), altText: enTitle, sortOrder: 0, isCover: true })

    if (pType !== 'land') {
      const numInt = randInt(1, 4)
      const shuffled = [...INTERIOR_IMAGES].sort(() => Math.random() - 0.5)
      for (let j = 0; j < numInt; j++) {
        assetBatch.push({ propertyId: id, kind: 'image', url: shuffled[j]!, altText: `Interior view ${j + 1}`, sortOrder: j + 1, isCover: false })
      }
    }

    const numFeat = pType === 'land' ? randInt(0, 2) : randInt(2, 7)
    const shuffledF = [...FEATURES_POOL].sort(() => Math.random() - 0.5)
    for (let j = 0; j < numFeat; j++) {
      featureBatch.push({ propertyId: id, featureCode: shuffledF[j]! })
    }

    count++

    if (count % BATCH_SIZE === 0 || count === TOTAL) {
      await db.insert(properties).values(propBatch)
      await db.insert(propertyTranslations).values(transBatch)
      await db.insert(propertyAssets).values(assetBatch)
      await db.insert(propertyFeatures).values(featureBatch)

      const pct = Math.round((count / TOTAL) * 100)
      const bar = '█'.repeat(Math.floor(pct / 2.5)) + '░'.repeat(40 - Math.floor(pct / 2.5))
      process.stdout.write(`\r  [${bar}] ${count.toLocaleString()}/${TOTAL.toLocaleString()} (${pct}%)`)

      propBatch = []
      transBatch = []
      assetBatch = []
      featureBatch = []
    }
  }

  console.log('\n')
  const r1 = await db.execute(sql`SELECT COUNT(*) as cnt FROM properties`)
  console.log(`  ✅ Properties: ${(r1 as any)[0]?.cnt}`)
  const r2 = await db.execute(sql`SELECT COUNT(*) as cnt FROM property_translations`)
  console.log(`  ✅ Translations: ${(r2 as any)[0]?.cnt}`)
  const r3 = await db.execute(sql`SELECT COUNT(*) as cnt FROM property_assets`)
  console.log(`  ✅ Assets: ${(r3 as any)[0]?.cnt}`)
  const r4 = await db.execute(sql`SELECT COUNT(*) as cnt FROM property_features`)
  console.log(`  ✅ Features: ${(r4 as any)[0]?.cnt}`)

  console.log(`\n🎉 Done! ${TOTAL.toLocaleString()} properties across ${NEIGHBORHOODS.length} Copenhagen neighborhoods`)
  await client.end()
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1) })
