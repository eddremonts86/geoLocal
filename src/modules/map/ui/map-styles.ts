import type { StyleSpecification } from 'maplibre-gl'

export type MapStyleId = 'liberty' | 'positron' | 'bright' | 'dark' | 'satellite'

interface MapStyleMeta {
  id: MapStyleId
  label: string
  /** Either a URL string to a style JSON, or an inline StyleSpecification */
  style: string | StyleSpecification
  /** Preview thumbnail (raster tile) for the switcher UI */
  preview: string
}

/**
 * Free tile providers — none require an API key.
 *  - OpenFreeMap (liberty / positron / bright / dark) — vector, community-hosted
 *  - Esri World Imagery — raster satellite, free with attribution
 */
export const MAP_STYLES: MapStyleMeta[] = [
  {
    id: 'liberty',
    label: 'Streets',
    style: 'https://tiles.openfreemap.org/styles/liberty',
    preview: 'https://tiles.openfreemap.org/1/0/0.png',
  },
  {
    id: 'positron',
    label: 'Light',
    style: 'https://tiles.openfreemap.org/styles/positron',
    preview: 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/1/0/0.png',
  },
  {
    id: 'bright',
    label: 'Bright',
    style: 'https://tiles.openfreemap.org/styles/bright',
    preview: 'https://tile.openstreetmap.org/1/0/0.png',
  },
  {
    id: 'dark',
    label: 'Dark',
    style: 'https://tiles.openfreemap.org/styles/dark',
    preview: 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/1/0/0.png',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    style: {
      version: 8,
      sources: {
        'esri-imagery': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution:
            'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxzoom: 19,
        },
      },
      layers: [
        { id: 'esri-imagery', type: 'raster', source: 'esri-imagery' },
      ],
      glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    },
    preview:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/1/0/0',
  },
]

export const DEFAULT_MAP_STYLE: MapStyleId = 'liberty'
const STORAGE_KEY = 'geo-dashboard.mapStyle'

export function getMapStyle(id: MapStyleId): MapStyleMeta {
  return MAP_STYLES.find((s) => s.id === id) ?? MAP_STYLES[0]
}

/** Default style for the current app theme (used when user hasn't picked one). */
export function themeDefaultStyle(resolved: 'light' | 'dark'): MapStyleId {
  return resolved === 'dark' ? 'dark' : 'bright'
}

/** Returns the user's explicit choice, or null if they never picked one. */
export function readPersistedStyle(): MapStyleId | null {
  if (typeof window === 'undefined') return null
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved && MAP_STYLES.some((s) => s.id === saved)) {
    return saved as MapStyleId
  }
  return null
}

export function persistStyle(id: MapStyleId): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    /* storage may be disabled; ignore */
  }
}
