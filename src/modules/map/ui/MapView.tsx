import { useRef, useEffect, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ListingCard } from '@/modules/listings/ui/ListingCard'
import type { ListingListItem } from '@/modules/listings/model/types'
import { MapToolbar, type MapDrawMode } from './MapToolbar'
import { MapStyleSwitcher } from './MapStyleSwitcher'
import { MapNavControls } from './MapNavControls'
import { getMapStyle, readPersistedStyle, persistStyle, themeDefaultStyle, type MapStyleId } from './map-styles'
import { useTheme } from '@/modules/shared/hooks/useTheme'

export interface MapMarker {
  id: string
  slug: string
  category: string
  price: number
  currency: string
  latitude: number
  longitude: number
}

/** Active spatial filter shown on the map. */
export type MapArea =
  | { type: 'radius'; lat: number; lng: number; radiusKm: number }
  | { type: 'polygon'; ring: [number, number][] } // [lng, lat]
  | null

interface MapViewProps {
  /** All markers to render (clustered). Lightweight shape. */
  markers: MapMarker[]
  /** Full items for rich popups when selected (optional subset). */
  items?: ListingListItem[]
  activeId?: string | null
  onSelect?: (id: string) => void
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
  center?: [number, number]
  zoom?: number
  /** Currently applied spatial filter to visualise. */
  area?: MapArea
  /** Called when the user draws or clears a spatial filter. */
  onAreaChange?: (area: MapArea) => void
  /** Default radius in km when user clicks "Near me" or draws a radius. */
  defaultRadiusKm?: number
  /** Hide the bottom-left toolbar (drawing tools / style switcher). Default false. */
  hideToolbar?: boolean
  /** Hide the right-side nav/zoom/geolocate stack. Default false. */
  hideNavControls?: boolean
  /** Disable pan/zoom/rotate/doubleClick interactions — turns map into a static display. Default true. */
  interactive?: boolean
}

const DEFAULT_CENTER: [number, number] = [12.5683, 55.6761]
const DEFAULT_ZOOM = 12
const SOURCE_ID = 'geo-listings'
const CLUSTER_LAYER = 'geo-clusters'
const CLUSTER_COUNT_LAYER = 'geo-cluster-count'
const UNCLUSTERED_LAYER = 'geo-unclustered'
const UNCLUSTERED_LABEL_LAYER = 'geo-unclustered-label'
const AREA_SOURCE = 'geo-area'
const AREA_FILL_LAYER = 'geo-area-fill'
const AREA_LINE_LAYER = 'geo-area-line'
const AREA_DRAFT_SOURCE = 'geo-area-draft'
const AREA_DRAFT_LINE = 'geo-area-draft-line'
const AREA_DRAFT_POINTS = 'geo-area-draft-points'
const USER_LOC_SOURCE = 'geo-user-location'
const USER_LOC_ACCURACY = 'geo-user-location-accuracy'
const USER_LOC_HALO = 'geo-user-location-halo'
const USER_LOC_DOT = 'geo-user-location-dot'

const CATEGORY_COLORS: Record<string, string> = {
  property: '#2563eb',   // cobalt
  vehicle: '#059669',    // emerald
  service: '#d97706',    // amber
  experience: '#9333ea', // violet
}

/** Approximate circle as a polygon ring (64 points) for GeoJSON rendering. */
function circleToPolygon(lng: number, lat: number, radiusKm: number, steps = 64): [number, number][] {
  const coords: [number, number][] = []
  const latR = (lat * Math.PI) / 180
  const kmPerDegLat = 111.32
  const kmPerDegLng = 111.32 * Math.cos(latR)
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI
    const dLat = (radiusKm * Math.sin(theta)) / kmPerDegLat
    const dLng = (radiusKm * Math.cos(theta)) / Math.max(kmPerDegLng, 0.01)
    coords.push([lng + dLng, lat + dLat])
  }
  return coords
}

function areaToGeoJSON(area: MapArea): GeoJSON.FeatureCollection {
  if (!area) return { type: 'FeatureCollection', features: [] }
  if (area.type === 'radius') {
    const ring = circleToPolygon(area.lng, area.lat, area.radiusKm)
    return {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: {} },
      ],
    }
  }
  // Polygon: ensure closed
  const ring = [...area.ring]
  if (ring.length > 0) {
    const [fx, fy] = ring[0]
    const [lx, ly] = ring[ring.length - 1]
    if (fx !== lx || fy !== ly) ring.push([fx, fy])
  }
  return {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: {} },
    ],
  }
}

/** Update the polygon draft source with the current vertex list. */
function updateDraft(map: maplibregl.Map, points: [number, number][]) {
  const src = map.getSource(AREA_DRAFT_SOURCE) as maplibregl.GeoJSONSource | undefined
  if (!src) return
  const features: GeoJSON.Feature[] = []
  for (const p of points) {
    features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: p }, properties: {} })
  }
  if (points.length >= 2) {
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: points },
      properties: {},
    })
  }
  src.setData({ type: 'FeatureCollection', features })
}

function formatMarkerPrice(price: number) {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M`
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K`
  return price.toString()
}

function markersToGeoJSON(markers: MapMarker[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: markers.map((m) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [m.longitude, m.latitude] },
      properties: {
        id: m.id,
        slug: m.slug,
        category: m.category,
        price: m.price,
        priceLabel: formatMarkerPrice(m.price),
      },
    })),
  }
}

export function MapView({
  markers,
  items,
  activeId,
  onSelect,
  onBoundsChange,
  center,
  zoom,
  area = null,
  onAreaChange,
  defaultRadiusKm = 5,
  hideToolbar = false,
  hideNavControls = false,
  interactive = true,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const popupContainerRef = useRef<HTMLDivElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [popupItem, setPopupItem] = useState<ListingListItem | null>(null)
  const [bearing, setBearing] = useState(0)

  // Drawing state
  const [drawMode, setDrawMode] = useState<MapDrawMode>('none')
  const drawModeRef = useRef<MapDrawMode>('none')
  const draftPointsRef = useRef<[number, number][]>([])
  const userPulseRafRef = useRef<number | null>(null)

  // Basemap style — theme-synced by default, user choice persisted across reloads
  const { resolvedTheme } = useTheme()
  const [userStyle, setUserStyle] = useState<MapStyleId | null>(() => readPersistedStyle())
  const styleId: MapStyleId = userStyle ?? themeDefaultStyle(resolvedTheme)
  const styleIdRef = useRef(styleId)
  useEffect(() => { styleIdRef.current = styleId }, [styleId])
  const setupOverlayRef = useRef<(() => void) | null>(null)

  const handleStyleChange = useCallback((id: MapStyleId) => {
    setUserStyle(id)
    persistStyle(id)
  }, [])

  // Stable refs for handlers used inside map.on() closures
  const onSelectRef = useRef(onSelect)
  const onBoundsChangeRef = useRef(onBoundsChange)
  const onAreaChangeRef = useRef(onAreaChange)
  const defaultRadiusRef = useRef(defaultRadiusKm)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  useEffect(() => { onBoundsChangeRef.current = onBoundsChange }, [onBoundsChange])
  useEffect(() => { onAreaChangeRef.current = onAreaChange }, [onAreaChange])
  useEffect(() => { defaultRadiusRef.current = defaultRadiusKm }, [defaultRadiusKm])
  useEffect(() => { drawModeRef.current = drawMode }, [drawMode])

  // Initialize map + clustered source + layers
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyle(styleIdRef.current).style,
      center: center ?? DEFAULT_CENTER,
      zoom: zoom ?? DEFAULT_ZOOM,
      interactive, // disable all pointer/keyboard interactions when false
      attributionControl: false,
    })

    // Native NavigationControl + GeolocateControl intentionally NOT added —
    // they're replaced by <MapNavControls /> below so all UI shares the same
    // shadcn design language as MapToolbar and MapStyleSwitcher.
    map.on('rotate', () => setBearing(map.getBearing()))
    map.on('rotateend', () => setBearing(map.getBearing()))

    /** Idempotent: adds all custom sources+layers. Safe to call on load AND after setStyle. */
    const setupOverlayLayers = () => {
      if (map.getSource(AREA_SOURCE)) return // already set up for this style
      // Area fill (below markers)
      map.addSource(AREA_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addLayer({
        id: AREA_FILL_LAYER,
        type: 'fill',
        source: AREA_SOURCE,
        paint: {
          'fill-color': '#f59e0b',
          'fill-opacity': 0.12,
        },
      })
      map.addLayer({
        id: AREA_LINE_LAYER,
        type: 'line',
        source: AREA_SOURCE,
        paint: {
          'line-color': '#f59e0b',
          'line-width': 2,
          'line-dasharray': [2, 1],
        },
      })

      // Draft (while drawing polygon)
      map.addSource(AREA_DRAFT_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addLayer({
        id: AREA_DRAFT_LINE,
        type: 'line',
        source: AREA_DRAFT_SOURCE,
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#f59e0b',
          'line-width': 2,
          'line-dasharray': [1, 1],
        },
      })
      map.addLayer({
        id: AREA_DRAFT_POINTS,
        type: 'circle',
        source: AREA_DRAFT_SOURCE,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-color': '#f59e0b',
          'circle-radius': 4,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      })

      // User location (pulsing blue dot, Google-Maps style)
      map.addSource(USER_LOC_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addLayer({
        id: USER_LOC_ACCURACY,
        type: 'circle',
        source: USER_LOC_SOURCE,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-color': '#2563eb',
          'circle-opacity': 0.12,
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            10, ['/', ['coalesce', ['get', 'accuracy'], 50], 20],
            16, ['/', ['coalesce', ['get', 'accuracy'], 50], 2],
          ],
          'circle-stroke-color': '#2563eb',
          'circle-stroke-opacity': 0.3,
          'circle-stroke-width': 1,
        },
      })
      map.addLayer({
        id: USER_LOC_HALO,
        type: 'circle',
        source: USER_LOC_SOURCE,
        paint: {
          'circle-color': '#2563eb',
          'circle-opacity': 0.25,
          'circle-radius': 14,
          'circle-blur': 0.6,
        },
      })
      map.addLayer({
        id: USER_LOC_DOT,
        type: 'circle',
        source: USER_LOC_SOURCE,
        paint: {
          'circle-color': '#2563eb',
          'circle-radius': 6,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2.5,
        },
      })

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      // Cluster circles — size & color by point count
      map.addLayer({
        id: CLUSTER_LAYER,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#93c5fd', 10,
            '#60a5fa', 50,
            '#3b82f6', 200,
            '#1d4ed8',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18, 10,
            22, 50,
            28, 200,
            34,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      map.addLayer({
        id: CLUSTER_COUNT_LAYER,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 13,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })

      // Unclustered points — category-colored
      map.addLayer({
        id: UNCLUSTERED_LAYER,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'category'],
            'property', CATEGORY_COLORS.property,
            'vehicle', CATEGORY_COLORS.vehicle,
            'service', CATEGORY_COLORS.service,
            'experience', CATEGORY_COLORS.experience,
            '#6b7280',
          ],
          'circle-radius': 14,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      map.addLayer({
        id: UNCLUSTERED_LABEL_LAYER,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'priceLabel'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 10,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })
    }

    // Expose so the style-change effect can call it
    setupOverlayRef.current = setupOverlayLayers

    map.on('load', () => {
      setupOverlayLayers()

      // Click cluster → zoom in
      map.on('click', CLUSTER_LAYER, async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] })
        const feat = features[0]
        if (!feat) return
        const clusterId = feat.properties?.cluster_id
        const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource
        if (!src || clusterId == null) return
        try {
          const expansionZoom = await src.getClusterExpansionZoom(clusterId)
          map.easeTo({
            center: (feat.geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: expansionZoom,
            duration: 500,
          })
        } catch { /* ignore */ }
      })

      // Click single point → select
      map.on('click', UNCLUSTERED_LAYER, (e) => {
        const feat = e.features?.[0]
        if (!feat) return
        const id = feat.properties?.id as string | undefined
        if (id) onSelectRef.current?.(id)
      })

      // ─── Drawing: generic map click ──────────────────────────────
      map.on('click', (e) => {
        const mode = drawModeRef.current
        if (mode === 'none') return

        if (mode === 'radius') {
          onAreaChangeRef.current?.({
            type: 'radius',
            lng: e.lngLat.lng,
            lat: e.lngLat.lat,
            radiusKm: defaultRadiusRef.current,
          })
          setDrawMode('none')
          return
        }

        if (mode === 'polygon') {
          draftPointsRef.current.push([e.lngLat.lng, e.lngLat.lat])
          updateDraft(map, draftPointsRef.current)
        }
      })

      // Double-click closes the polygon (min 3 points)
      map.on('dblclick', (e) => {
        if (drawModeRef.current !== 'polygon') return
        e.preventDefault()
        const pts = draftPointsRef.current
        if (pts.length >= 3) {
          onAreaChangeRef.current?.({ type: 'polygon', ring: [...pts] })
        }
        draftPointsRef.current = []
        updateDraft(map, [])
        setDrawMode('none')
      })

      for (const layer of [CLUSTER_LAYER, UNCLUSTERED_LAYER]) {
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = '' })
      }

      setIsLoaded(true)
    })

    map.on('moveend', () => {
      const b = map.getBounds()
      onBoundsChangeRef.current?.({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Swap basemap style — re-attach custom sources/layers after new style loads
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isLoaded) return
    const newStyle = getMapStyle(styleId).style
    map.setStyle(newStyle as never, { diff: false })
    const reattach = () => {
      setupOverlayRef.current?.()
      // Repaint current data (sources were recreated empty)
      const mSrc = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
      mSrc?.setData(markersToGeoJSON(markers))
      const aSrc = map.getSource(AREA_SOURCE) as maplibregl.GeoJSONSource | undefined
      aSrc?.setData(areaToGeoJSON(area))
    }
    // `style.load` fires exactly once after the new style is fully parsed.
    map.once('style.load', reattach)
    return () => { map.off('style.load', reattach) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleId, isLoaded])

  // Update source data when markers change
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return
    const src = mapRef.current.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    src?.setData(markersToGeoJSON(markers))
  }, [markers, isLoaded])

  // Sync active area visualisation
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return
    const src = mapRef.current.getSource(AREA_SOURCE) as maplibregl.GeoJSONSource | undefined
    src?.setData(areaToGeoJSON(area))
  }, [area, isLoaded])

  // Cursor + double-click zoom while drawing
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isLoaded) return
    if (drawMode === 'none') {
      map.getCanvas().style.cursor = ''
      map.doubleClickZoom.enable()
    } else {
      map.getCanvas().style.cursor = 'crosshair'
      map.doubleClickZoom.disable()
    }
  }, [drawMode, isLoaded])

  // Reset draft if mode exits polygon
  useEffect(() => {
    if (drawMode !== 'polygon' && mapRef.current && isLoaded) {
      draftPointsRef.current = []
      updateDraft(mapRef.current, [])
    }
  }, [drawMode, isLoaded])

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 200 })
  }, [])
  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 200 })
  }, [])
  const handleResetNorth = useCallback(() => {
    mapRef.current?.easeTo({ bearing: 0, pitch: 0, duration: 400 })
  }, [])

  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords
        const map = mapRef.current
        if (!map) return
        // Paint the user-location pulse
        const src = map.getSource(USER_LOC_SOURCE) as maplibregl.GeoJSONSource | undefined
        src?.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [lng, lat] },
              properties: { accuracy: accuracy ?? 50 },
            },
          ],
        })
        // Start the halo pulse animation
        if (userPulseRafRef.current != null) cancelAnimationFrame(userPulseRafRef.current)
        const start = performance.now()
        const tick = (now: number) => {
          const m = mapRef.current
          if (!m || !m.getLayer(USER_LOC_HALO)) return
          const t = ((now - start) / 1500) % 1 // 1.5s loop
          const radius = 8 + t * 22          // 8 → 30
          const opacity = 0.35 * (1 - t)      // 0.35 → 0
          m.setPaintProperty(USER_LOC_HALO, 'circle-radius', radius)
          m.setPaintProperty(USER_LOC_HALO, 'circle-opacity', opacity)
          userPulseRafRef.current = requestAnimationFrame(tick)
        }
        userPulseRafRef.current = requestAnimationFrame(tick)

        onAreaChangeRef.current?.({
          type: 'radius',
          lat,
          lng,
          radiusKm: defaultRadiusRef.current,
        })
        map.easeTo({ center: [lng, lat], zoom: 13, duration: 700 })
      },
      () => { /* permission denied — silently ignore */ },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [])

  const handleClearArea = useCallback(() => {
    setDrawMode('none')
    draftPointsRef.current = []
    if (mapRef.current) updateDraft(mapRef.current, [])
    if (userPulseRafRef.current != null) {
      cancelAnimationFrame(userPulseRafRef.current)
      userPulseRafRef.current = null
    }
    const userSrc = mapRef.current?.getSource(USER_LOC_SOURCE) as
      | maplibregl.GeoJSONSource
      | undefined
    userSrc?.setData({ type: 'FeatureCollection', features: [] })
    onAreaChangeRef.current?.(null)
  }, [])

  const closePopup = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.remove()
      popupRef.current = null
    }
    popupContainerRef.current = null
    setPopupItem(null)
  }, [])

  // Open popup for active selection, preferring rich data from the list
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !activeId) {
      closePopup()
      return
    }
    const rich = items?.find((i) => i.id === activeId)
    if (rich) {
      mapRef.current.easeTo({ center: [rich.longitude, rich.latitude], duration: 500 })
      closePopup()
      const container = document.createElement('div')
      popupContainerRef.current = container
      const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '224px',
        offset: 20,
        className: 'geo-bubble-popup',
      })
        .setLngLat([rich.longitude, rich.latitude])
        .setDOMContent(container)
        .addTo(mapRef.current)
      popup.on('close', () => closePopup())
      popupRef.current = popup
      setPopupItem(rich)
      return
    }
    const m = markers.find((x) => x.id === activeId)
    if (m && mapRef.current) {
      mapRef.current.easeTo({ center: [m.longitude, m.latitude], duration: 500 })
      closePopup()
      const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '224px',
        offset: 20,
        className: 'geo-bubble-popup',
      })
        .setLngLat([m.longitude, m.latitude])
        .setHTML(
          `<a href="/listing/${m.slug}" class="geo-popup-lite">
            <div class="geo-popup-lite-cat">${m.category}</div>
            <div class="geo-popup-lite-price">${formatMarkerPrice(m.price)} ${m.currency}</div>
            <div class="geo-popup-lite-cta">View details →</div>
          </a>`,
        )
        .addTo(mapRef.current)
      popup.on('close', () => closePopup())
      popupRef.current = popup
    }
  }, [activeId, items, markers, isLoaded, closePopup])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {!hideToolbar && (
        <MapToolbar
          drawMode={drawMode}
          area={
            area
              ? area.type === 'radius'
                ? { type: 'radius', radiusKm: area.radiusKm }
                : { type: 'polygon', vertices: area.ring.length }
              : null
          }
          onNearMe={handleNearMe}
          onStartRadius={() => setDrawMode((m) => (m === 'radius' ? 'none' : 'radius'))}
          onStartPolygon={() => setDrawMode((m) => (m === 'polygon' ? 'none' : 'polygon'))}
          onClear={handleClearArea}
          onRadiusChange={(km) => {
            if (area?.type === 'radius') {
              onAreaChangeRef.current?.({ type: 'radius', lat: area.lat, lng: area.lng, radiusKm: km })
            }
          }}
          styleSlot={<MapStyleSwitcher value={styleId} onChange={handleStyleChange} />}
        />
      )}
      {/* Right-side navigation stack — unified design language with MapToolbar */}
      {!hideNavControls && (
        <div className="pointer-events-auto absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
          <MapNavControls
            bearing={bearing}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetNorth={handleResetNorth}
            onGeolocate={handleNearMe}
          />
        </div>
      )}
      {popupItem && popupContainerRef.current && createPortal(
        <ListingCard item={popupItem} variant="bubble" onSelect={() => onSelect?.(popupItem.id)} />,
        popupContainerRef.current,
      )}
      <style>{`
        .geo-bubble-popup .maplibregl-popup-content {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .geo-bubble-popup .maplibregl-popup-tip {
          border-top-color: var(--color-card);
        }
        .geo-bubble-popup .maplibregl-popup-close-button {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.45);
          color: white;
          border-radius: 50%;
          font-size: 14px;
          line-height: 1;
          padding: 0;
          z-index: 10;
          transition: background 150ms ease;
        }
        .geo-bubble-popup .maplibregl-popup-close-button:hover {
          background: rgba(0,0,0,0.7);
        }
        .geo-popup-lite {
          display: block;
          padding: 12px 14px;
          background: var(--color-card);
          color: var(--color-foreground);
          text-decoration: none;
          font-family: system-ui, sans-serif;
          min-width: 160px;
        }
        .geo-popup-lite-cat {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-3, #6b7280);
          margin-bottom: 4px;
        }
        .geo-popup-lite-price {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .geo-popup-lite-cta {
          font-size: 11px;
          color: var(--amber-ink, #b45309);
        }
      `}</style>
    </div>
  )
}
