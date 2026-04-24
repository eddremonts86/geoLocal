/**
 * Additive vehicle seed — 5 000 new listings across all 8 subcategories.
 * Does NOT truncate existing data.
 * Run: pnpm tsx scripts/seed-vehicles-extra.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { randomUUID } from 'node:crypto'
import {
  listings,
  listingVehicles,
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
  { key: 'indre-by',       en: 'Indre By',       es: 'Centro',          lat: [55.675, 55.684] as [number,number], lng: [12.566, 12.583] as [number,number] },
  { key: 'norrebro',       en: 'Nørrebro',        es: 'Nørrebro',        lat: [55.690, 55.702] as [number,number], lng: [12.540, 12.565] as [number,number] },
  { key: 'vesterbro',      en: 'Vesterbro',       es: 'Vesterbro',       lat: [55.665, 55.677] as [number,number], lng: [12.540, 12.565] as [number,number] },
  { key: 'osterbro',       en: 'Østerbro',        es: 'Østerbro',        lat: [55.695, 55.710] as [number,number], lng: [12.570, 12.590] as [number,number] },
  { key: 'frederiksberg',  en: 'Frederiksberg',   es: 'Frederiksberg',   lat: [55.675, 55.690] as [number,number], lng: [12.520, 12.540] as [number,number] },
  { key: 'amager',         en: 'Amager',          es: 'Amager',          lat: [55.640, 55.665] as [number,number], lng: [12.590, 12.608] as [number,number] },
  { key: 'nordhavn',       en: 'Nordhavn',        es: 'Nordhavn',        lat: [55.710, 55.720] as [number,number], lng: [12.590, 12.604] as [number,number] },
  { key: 'christianshavn', en: 'Christianshavn',  es: 'Christianshavn',  lat: [55.670, 55.680] as [number,number], lng: [12.585, 12.600] as [number,number] },
  { key: 'valby',          en: 'Valby',           es: 'Valby',           lat: [55.650, 55.670] as [number,number], lng: [12.500, 12.530] as [number,number] },
  { key: 'vanlose',        en: 'Vanløse',         es: 'Vanløse',         lat: [55.680, 55.695] as [number,number], lng: [12.480, 12.510] as [number,number] },
] as const

type Hood = typeof NEIGHBORHOODS[number]

// ─── Vehicle subcategory type ──────────────────────────────────────────────

const VEHICLE_SUBCATS = ['car', 'suv', 'motorcycle', 'bicycle', 'boat', 'airplane', 'commercial_vehicle', 'truck'] as const
type VehicleSubCat = typeof VEHICLE_SUBCATS[number]

// ─── Makes / models per subcat ─────────────────────────────────────────────

const MAKES: Record<VehicleSubCat, { make: string; models: string[] }[]> = {
  car: [
    { make: 'Toyota',        models: ['Corolla', 'Camry', 'Yaris', 'Prius', 'GR86'] },
    { make: 'Volkswagen',    models: ['Golf', 'Polo', 'Passat', 'Arteon', 'ID.3'] },
    { make: 'BMW',           models: ['1 Series', '2 Series', '3 Series', 'i3', 'M3'] },
    { make: 'Mercedes-Benz', models: ['A-Class', 'C-Class', 'E-Class', 'EQA', 'EQB'] },
    { make: 'Audi',          models: ['A1', 'A3', 'A4', 'A5', 'TT'] },
    { make: 'Ford',          models: ['Focus', 'Fiesta', 'Galaxy', 'Fusion', 'Mondeo'] },
    { make: 'Hyundai',       models: ['i20', 'i30', 'Elantra', 'Ioniq 6', 'Sonata'] },
    { make: 'Tesla',         models: ['Model 3', 'Model S'] },
    { make: 'Peugeot',       models: ['208', '308', '508', 'e-208', 'e-308'] },
    { make: 'Volvo',         models: ['S60', 'V60', 'S90', 'V90', 'C40'] },
  ],
  suv: [
    { make: 'Toyota',        models: ['RAV4', 'Land Cruiser', 'C-HR', 'Fortuner', 'Highlander'] },
    { make: 'BMW',           models: ['X1', 'X3', 'X5', 'X7', 'iX'] },
    { make: 'Mercedes-Benz', models: ['GLA', 'GLB', 'GLC', 'GLE', 'EQC'] },
    { make: 'Audi',          models: ['Q2', 'Q3', 'Q5', 'Q7', 'e-tron'] },
    { make: 'Ford',          models: ['EcoSport', 'Kuga', 'Explorer', 'Edge', 'Mach-E'] },
    { make: 'Hyundai',       models: ['Tucson', 'Santa Fe', 'Kona', 'Ioniq 5', 'Palisade'] },
    { make: 'Jeep',          models: ['Renegade', 'Compass', 'Wrangler', 'Grand Cherokee', 'Gladiator'] },
    { make: 'Land Rover',    models: ['Defender', 'Discovery', 'Range Rover Sport', 'Range Rover Velar', 'Evoque'] },
    { make: 'Volvo',         models: ['XC40', 'XC60', 'XC90', 'EX40', 'EX90'] },
    { make: 'Nissan',        models: ['Juke', 'Qashqai', 'X-Trail', 'Pathfinder', 'Ariya'] },
  ],
  motorcycle: [
    { make: 'Honda',     models: ['CB500F', 'CBR650R', 'CRF450L', 'Africa Twin', 'Rebel 1100'] },
    { make: 'Yamaha',    models: ['MT-07', 'MT-09', 'R1', 'Tracer 9', 'Ténéré 700'] },
    { make: 'BMW',       models: ['R 1250 GS', 'R 1250 RT', 'F 900 XR', 'S 1000 RR', 'M 1000 RR'] },
    { make: 'Ducati',    models: ['Monster 937', 'Panigale V4', 'Scrambler', 'Multistrada V4', 'Diavel V4'] },
    { make: 'KTM',       models: ['390 Duke', '790 Adventure', '1290 Super Duke R', 'RC 390', 'Duke 890'] },
    { make: 'Kawasaki',  models: ['Z900', 'Ninja 650', 'Versys 1000', 'Z400', 'H2'] },
    { make: 'Triumph',   models: ['Bonneville T120', 'Street Triple RS', 'Tiger 900', 'Rocket 3', 'Speed Triple 1200'] },
    { make: 'Harley-Davidson', models: ['Sportster S', 'Fat Bob 114', 'Road Glide', 'Street Glide', 'Pan America'] },
  ],
  bicycle: [
    { make: 'Trek',        models: ['FX 3', 'Domane SL 6', 'Marlin 7', 'Rail 9.8', 'Verve 3'] },
    { make: 'Giant',       models: ['Escape 2', 'Defy Advanced', 'Trance X 29', 'Talon 29', 'FastRoad E+'] },
    { make: 'Specialized', models: ['Sirrus 3.0', 'Roubaix Comp', 'Stumpjumper EVO', 'Turbo Vado SL', 'Allez Sport'] },
    { make: 'Cannondale',  models: ['Quick 4', 'Synapse Carbon', 'Trail SE 3', 'Topstone 4', 'Treadwell 3'] },
    { make: 'Bianchi',     models: ['Impulso Sport', 'Sprint', 'Camaleonte 1', 'Aria Disc', 'Oltre RC'] },
    { make: 'Scott',       models: ['Sub Cross', 'Addict RC', 'Scale 930', 'Spark 960', 'Aspect 950'] },
    { make: 'Cube',        models: ['Attention SL', 'Agree C:62', 'Stereo One44', 'Hyde Race', 'Kathmandu Hybrid'] },
    { make: 'Brompton',    models: ['M6L', 'S6L', 'P Line Urban', 'C Line Explore', 'Electric P Line'] },
  ],
  boat: [
    { make: 'Yamaha Marine',   models: ['242X', '195', '275SD', 'AR240', 'SX210'] },
    { make: 'Sea-Doo',         models: ['GTX 230', 'RXP-X 325', 'Spark 90', 'Fish Pro Trophy', 'Wake Pro 230'] },
    { make: 'Boston Whaler',   models: ['130 Super Sport', '210 Montauk', '270 Dauntless', '345 Conquest', '420 Outrage'] },
    { make: 'Sunseeker',       models: ['Predator 65', 'Manhattan 68', 'Superhawk 55', 'Portofino 48', 'Sport 74'] },
    { make: 'Bayliner',        models: ['Element E16', 'VR4 Bowrider', 'Trophy 21', 'Ciera 8', 'VR6'] },
    { make: 'Jeanneau',        models: ['Leader 6.5', 'Sun Odyssey 410', 'Merry Fisher 895', 'Cap Camarat 7.5 WA', 'DB 43'] },
    { make: 'Zodiac',          models: ['Medline 7.5 RIB', 'Milpro 550 PRO', 'Cadet 340', 'Bayrunner 700', 'Open 5.5'] },
    { make: 'Fairline',        models: ['Targa 40', 'Squadron 53', 'F//Line 33', 'F//Line 27', 'Phantom 48'] },
  ],
  airplane: [
    { make: 'Cessna',      models: ['172 Skyhawk', '182 Skylane', '208 Caravan', 'Citation M2', 'TTx T240'] },
    { make: 'Piper',       models: ['PA-28 Cherokee', 'PA-32 Saratoga', 'M350', 'M600', 'Seneca V'] },
    { make: 'Beechcraft',  models: ['Bonanza G36', 'Baron G58', 'King Air C90GTx', 'King Air 350', 'T-6 Texan II'] },
    { make: 'Diamond',     models: ['DA20-C1', 'DA40 NG', 'DA42 VI', 'DA50 RG', 'DA62'] },
    { make: 'Cirrus',      models: ['SR20', 'SR22', 'SR22T', 'Vision Jet G2', 'SR22 GTS'] },
    { make: 'Robin',       models: ['DR 400/180', 'DR 400/200i', 'HR 200', 'R 3000', 'DR 500 President'] },
    { make: 'Pipistrel',   models: ['Sinus 912', 'Alpha Trainer', 'Velis Electro', 'Panthera', 'Nuuva V300'] },
    { make: 'Icon',        models: ['A5'] },
  ],
  commercial_vehicle: [
    { make: 'Mercedes-Benz', models: ['Sprinter 314', 'Sprinter 519', 'Vito 116', 'V-Class 250d', 'Citan 110'] },
    { make: 'Ford',          models: ['Transit Custom', 'Transit 350', 'Transit Connect', 'Tourneo Custom', 'E-Transit'] },
    { make: 'Volkswagen',    models: ['Crafter 35', 'Transporter T6.1', 'Caddy Cargo', 'Amarok 3.0', 'Multivan'] },
    { make: 'Renault',       models: ['Master 2.3 dCi', 'Trafic', 'Kangoo', 'Express', 'Zoe Cargo'] },
    { make: 'Iveco',         models: ['Daily 35S16', 'Daily 70C18', 'S-Way', 'Stralis NP', 'Eurocargo 75E'] },
    { make: 'Citroën',       models: ['Berlingo Cargo', 'Jumpy', 'Jumper L3H2', 'ë-Jumpy', 'Dispatch'] },
    { make: 'Peugeot',       models: ['Partner', 'Expert', 'Boxer', 'e-Expert', 'e-Boxer'] },
    { make: 'Opel',          models: ['Combo Cargo', 'Vivaro', 'Movano', 'Zafira Life', 'Insignia Sports Tourer'] },
  ],
  truck: [
    { make: 'Volvo Trucks',    models: ['FH 500', 'FMX 540', 'FM 420', 'FE 280', 'FL 250'] },
    { make: 'Scania',          models: ['R 450 A4x2', 'G 410 B4x2', 'P 280 B4x2', 'S 770 A6x4', 'Interlink 360'] },
    { make: 'Mercedes-Benz',   models: ['Actros 1845', 'Arocs 3245', 'Atego 1224', 'Econic 2630', 'Zetros 3643'] },
    { make: 'MAN',             models: ['TGX 18.580', 'TGS 26.440', 'TGM 18.290', 'TGL 8.180', 'TGE 5.180'] },
    { make: 'DAF',             models: ['XF 480', 'XG+ 530', 'CF 340', 'LF 260', 'XD 450'] },
    { make: 'Renault Trucks',  models: ['T 520', 'C 460', 'K 430', 'D 280', 'Master Traction'] },
    { make: 'Iveco',           models: ['S-Way AS440S47', 'X-Way 570', 'T-Way AT720T47W', 'Trakker 450', 'Hi-Way 460'] },
    { make: 'Ford',            models: ['F-150', 'F-250 Super Duty', 'Ranger', 'F-350', 'Maverick'] },
  ],
}

// ─── Per-subcat Unsplash images ────────────────────────────────────────────

const IMAGES: Record<VehicleSubCat, string[]> = {
  car: [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-2f218e7bfa64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1619767886558-efdc259b6e09?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&h=600&fit=crop',
  ],
  suv: [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-2f218e7bfa64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563720223523-8c8e7c9a4d23?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-2f218e7bfa64?w=800&h=600&fit=crop',
  ],
  motorcycle: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1525160354320-d8e92641c563?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1575831580064-01f10d38aa0b?w=800&h=600&fit=crop',
  ],
  bicycle: [
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop',
  ],
  boat: [
    'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520637836993-5c1e37d6d4ed?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564767655658-4e3e8f6fc4fa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1539183204366-63a0589187ab?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1580683852903-c7c8ac020d52?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&h=600&fit=crop',
  ],
  airplane: [
    'https://images.unsplash.com/photo-1569038786784-39eb5e2d0bfc?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1525296437636-f05b1ae34f3d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&h=600&fit=crop',
  ],
  commercial_vehicle: [
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519003300449-424ad0405076?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&h=600&fit=crop',
  ],
  truck: [
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519003300449-424ad0405076?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506717847107-a7b7af52f4c4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1464219222984-216ebffaaf85?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1554492269-b95c1ae756e5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop',
  ],
}

// ─── Per-subcat features ───────────────────────────────────────────────────

const FEATURES_POOL: Record<VehicleSubCat, string[]> = {
  car: ['bluetooth', 'gps', 'leather_seats', 'sunroof', 'backup_camera', 'heated_seats', 'cruise_control', 'apple_carplay', 'android_auto', 'parking_sensors', 'keyless_entry', 'alloy_wheels'],
  suv: ['bluetooth', 'gps', 'leather_seats', 'sunroof', 'backup_camera', 'heated_seats', 'cruise_control', 'apple_carplay', 'android_auto', 'parking_sensors', 'keyless_entry', 'alloy_wheels', 'tow_hitch', 'roof_rails', 'awd'],
  motorcycle: ['bluetooth', 'abs', 'traction_control', 'cruise_control', 'led_lights', 'gps', 'quickshifter', 'heated_grips', 'keyless_start', 'tire_pressure_monitor'],
  bicycle: ['hydraulic_brakes', 'carbon_frame', 'tubeless_tires', 'electronic_shifting', 'ebike_motor', 'rear_rack', 'mudguards', 'lights', 'integrated_lock', 'dropper_post'],
  boat: ['gps_chartplotter', 'vhf_radio', 'autopilot', 'fish_finder', 'inboard_motor', 'outboard_motor', 'anchor', 'life_jackets', 'bimini_top', 'trailer_included', 'cabin', 'wakeboard_tower'],
  airplane: ['autopilot', 'glass_cockpit', 'ads_b', 'garmin_avionics', 'deicing', 'oxygen_system', 'leather_interior', 'air_conditioning', 'parachute_system', 'ifr_certified', 'oxygen_tank', 'weather_radar'],
  commercial_vehicle: ['bluetooth', 'gps', 'backup_camera', 'cruise_control', 'parking_sensors', 'air_conditioning', 'bulkhead', 'roof_rack', 'tow_bar', 'dual_sliding_doors', 'ply_lined', 'racking'],
  truck: ['gps', 'cruise_control', 'air_suspension', 'retarder', 'diff_lock', 'tachograph', 'hydraulics', 'tail_lift', 'refrigeration', 'ebs', 'lane_assist', 'adr_certified'],
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function randInt(min: number, max: number) { return Math.floor(rand(min, max + 1)) }
function pick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function pickN<T>(arr: readonly T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length))
}
function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') }

let slugCounter = 0
function uniqueSlug(base: string) {
  slugCounter++
  return `${slugify(base)}-${slugCounter}-${randomUUID().slice(0, 6)}`
}

function randomCoords(hood: Hood) {
  return {
    lat: rand(hood.lat[0], hood.lat[1]),
    lng: rand(hood.lng[0], hood.lng[1]),
  }
}

// ─── Price ranges per subcat ───────────────────────────────────────────────

function priceFor(subCat: VehicleSubCat, txType: 'buy' | 'rent'): number {
  if (txType === 'rent') {
    const daily: Record<VehicleSubCat, [number, number]> = {
      car:               [300,  3000],
      suv:               [500,  5000],
      motorcycle:        [200,  1500],
      bicycle:           [50,   300],
      boat:              [2000, 20000],
      airplane:          [8000, 80000],
      commercial_vehicle:[800,  6000],
      truck:             [2000, 15000],
    }
    const [lo, hi] = daily[subCat]
    return randInt(lo, hi)
  }
  const buy: Record<VehicleSubCat, [number, number]> = {
    car:               [50000,   800000],
    suv:               [80000,  1200000],
    motorcycle:        [15000,   200000],
    bicycle:           [2000,    60000],
    boat:              [50000,  5000000],
    airplane:          [500000, 20000000],
    commercial_vehicle:[100000,  600000],
    truck:             [200000, 3000000],
  }
  const [lo, hi] = buy[subCat]
  return randInt(lo, hi)
}

// ─── Title / summary translations per subcat ──────────────────────────────

const SUBCAT_LABEL: Record<VehicleSubCat, { en: string; es: string }> = {
  car:               { en: 'Car',                 es: 'Auto' },
  suv:               { en: 'SUV',                 es: 'SUV' },
  motorcycle:        { en: 'Motorcycle',           es: 'Motocicleta' },
  bicycle:           { en: 'Bicycle',              es: 'Bicicleta' },
  boat:              { en: 'Boat',                 es: 'Bote' },
  airplane:          { en: 'Airplane',             es: 'Avión' },
  commercial_vehicle:{ en: 'Commercial Vehicle',   es: 'Vehículo Comercial' },
  truck:             { en: 'Truck',                es: 'Camión' },
}

// ─── Generator ─────────────────────────────────────────────────────────────

function generateVehicle(hood: Hood) {
  const subCat: VehicleSubCat = pick(VEHICLE_SUBCATS)
  const txType = Math.random() < 0.65 ? 'buy' : 'rent' as const
  const { lat, lng } = randomCoords(hood)

  const pool = MAKES[subCat]
  const maker = pick(pool)
  const make = maker.make
  const model = pick(maker.models)
  const year = randInt(2005, 2025)
  const price = priceFor(subCat, txType)
  const label = SUBCAT_LABEL[subCat]

  const mileageKm = subCat === 'airplane'
    ? randInt(100, 5000)         // hours logged as km proxy
    : subCat === 'boat'
      ? randInt(50, 20000)
      : subCat === 'bicycle'
        ? randInt(100, 15000)
        : randInt(1000, 200000)

  const fuelType = ['bicycle', 'airplane'].includes(subCat) ? null
    : pick(['gasoline', 'diesel', 'electric', 'hybrid'] as const)

  const transmission = ['bicycle', 'motorcycle', 'boat', 'airplane', 'truck', 'commercial_vehicle'].includes(subCat)
    ? null
    : pick(['manual', 'automatic'] as const)

  const color = pick(['Black', 'White', 'Silver', 'Blue', 'Red', 'Grey', 'Green', 'Yellow', 'Orange', 'Brown'])
  const pricePeriod = txType === 'rent' ? 'daily' : 'one_time'

  const titleEn = `${year} ${make} ${model}`
  const titleEs = `${year} ${make} ${model}`
  const summaryEn = `${year} ${label.en} — ${make} ${model} with ${mileageKm.toLocaleString()} km. Located in ${hood.en}, Copenhagen.`
  const summaryEs = `${label.es} ${year} — ${make} ${model} con ${mileageKm.toLocaleString()} km. Ubicado en ${hood.es}, Copenhague.`
  const descEn = `Well-maintained ${make} ${model} from ${year}. ${fuelType ? `Fuel type: ${fuelType}.` : ''} ${transmission ? `Transmission: ${transmission}.` : ''} Color: ${color}. Available in the ${hood.en} area of Copenhagen.`
  const descEs = `${make} ${model} de ${year} en excelente estado. ${fuelType ? `Combustible: ${fuelType}.` : ''} ${transmission ? `Transmisión: ${transmission}.` : ''} Color: ${color}. Disponible en la zona de ${hood.es}, Copenhague.`

  return {
    listing: {
      id: randomUUID(),
      slug: uniqueSlug(`${subCat}-${make}-${model}`),
      category: 'vehicle' as const,
      subCategory: subCat,
      transactionType: txType,
      status: 'published' as const,
      price,
      currency: 'DKK',
      pricePeriod: pricePeriod as 'daily' | 'one_time',
      latitude: lat,
      longitude: lng,
      addressLine1: `${hood.en} ${randInt(1, 200)}`,
      city: 'Copenhagen',
      country: 'DK',
      featured: Math.random() < 0.04,
      publishedAt: new Date(),
    },
    extension: {
      make,
      model,
      year,
      mileageKm,
      fuelType,
      transmission,
      color,
      engineDisplacementCc: ['bicycle', 'boat', 'airplane'].includes(subCat) ? null : randInt(800, 6000),
      doors: ['car', 'suv'].includes(subCat) ? pick([2, 4, 5]) : null,
    },
    translations: {
      en: { title: titleEn, summary: summaryEn, description: descEn, neighborhood: hood.en },
      es: { title: titleEs, summary: summaryEs, description: descEs, neighborhood: hood.es },
    },
    images: pickN(IMAGES[subCat], randInt(3, 5)),
    features: pickN(FEATURES_POOL[subCat], randInt(3, 6)),
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

const TOTAL = 5000
const BATCH_SIZE = 500

async function seed() {
  console.log(`🚗 Adding ${TOTAL} new vehicle listings (all subcategories)…`)
  console.log('   Existing data is preserved.\n')

  let created = 0

  while (created < TOTAL) {
    const batchSize = Math.min(BATCH_SIZE, TOTAL - created)
    const batchListings: any[] = []
    const batchExtensions: any[] = []
    const batchTranslations: any[] = []
    const batchAssets: any[] = []
    const batchFeatures: any[] = []

    for (let i = 0; i < batchSize; i++) {
      const hood = pick(NEIGHBORHOODS)
      const item = generateVehicle(hood)

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
    await db.insert(listingVehicles).values(batchExtensions)
    await db.insert(listingTranslations).values(batchTranslations)
    await db.insert(listingAssets).values(batchAssets)
    await db.insert(listingFeatures).values(batchFeatures)

    created += batchSize
    process.stdout.write(`  ${created}/${TOTAL} inserted\r`)
  }

  console.log(`\n✅ Done — ${TOTAL} vehicle listings added across all subcategories`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
