import { MapPin, Compass, Hexagon, X, MousePointerClick } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/shared/lib/utils'

export type MapDrawMode = 'none' | 'radius' | 'polygon'

export type MapAreaSummary =
  | { type: 'radius'; radiusKm: number }
  | { type: 'polygon'; vertices: number }
  | null

interface MapToolbarProps {
  drawMode: MapDrawMode
  area: MapAreaSummary
  onNearMe: () => void
  onStartRadius: () => void
  onStartPolygon: () => void
  onClear: () => void
  onRadiusChange?: (km: number) => void
  /** Optional slot rendered inside the toolbar pill (e.g. basemap switcher). */
  styleSlot?: React.ReactNode
}

const RADIUS_PRESETS = [1, 5, 10, 25, 50] as const

export function MapToolbar({
  drawMode,
  area,
  onNearMe,
  onStartRadius,
  onStartPolygon,
  onClear,
  onRadiusChange,
  styleSlot,
}: MapToolbarProps) {
  const { t } = useTranslation()
  const hasArea = area !== null

  return (
    <TooltipProvider delayDuration={300}>
      {/* ── Main toolbar (top-left) ── */}
      <div className="pointer-events-auto absolute left-3 top-3 z-10 flex flex-col items-start gap-2">
        <div className="flex items-center gap-1 rounded-md border border-border bg-background/95 p-1 shadow-sm backdrop-blur-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onNearMe}
                className="h-8 gap-1.5 px-2.5"
                aria-label={t('map.nearMe', 'Near me')}
              >
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="hidden md:inline text-xs">{t('map.nearMe', 'Near me')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t('map.nearMeHint', 'Use my current location')}</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          <ToggleGroup
            type="single"
            value={drawMode === 'none' ? '' : drawMode}
            onValueChange={(v) => {
              if (v === 'radius') onStartRadius()
              else if (v === 'polygon') onStartPolygon()
              else if (drawMode !== 'none') {
                // toggle off current mode by re-calling its starter
                if (drawMode === 'radius') onStartRadius()
                else onStartPolygon()
              }
            }}
            className="gap-1"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="radius"
                  size="sm"
                  className="h-8 gap-1.5 px-2.5 hover:bg-accent hover:text-accent-foreground"
                  aria-label={t('map.radius', 'Radius')}
                >
                  <Compass className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="hidden md:inline text-xs">{t('map.radius', 'Radius')}</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t('map.drawRadius', 'Draw a radius')}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="polygon"
                  size="sm"
                  className="h-8 gap-1.5 px-2.5 hover:bg-accent hover:text-accent-foreground"
                  aria-label={t('map.area', 'Area')}
                >
                  <Hexagon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="hidden md:inline text-xs">{t('map.area', 'Area')}</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t('map.drawArea', 'Draw a polygon')}</TooltipContent>
            </Tooltip>
          </ToggleGroup>

          {styleSlot && (
            <>
              <Separator orientation="vertical" className="h-6" />
              {styleSlot}
            </>
          )}
        </div>

        {/* ── Active area card ── */}
        {hasArea && (
          <div className="flex flex-col gap-2 rounded-md border border-(--amber)/60 bg-background/95 p-2 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 bg-(--amber)/15 text-(--amber-ink) hover:bg-(--amber)/20">
                {area.type === 'radius' ? (
                  <Compass className="h-3 w-3" strokeWidth={2} />
                ) : (
                  <Hexagon className="h-3 w-3" strokeWidth={2} />
                )}
                <span className="tabular-nums">
                  {area.type === 'radius'
                    ? t('map.radiusLabel', '{{km}} km', { km: area.radiusKm })
                    : t('map.polygonLabel', '{{n}} vertices', { n: area.vertices })}
                </span>
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={onClear}
                    className="ml-auto h-6 w-6 text-muted-foreground hover:text-destructive"
                    aria-label={t('map.clearArea', 'Clear area')}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t('map.clearArea', 'Clear area')}</TooltipContent>
              </Tooltip>
            </div>

            {area.type === 'radius' && onRadiusChange && (
              <ToggleGroup
                type="single"
                value={
                  RADIUS_PRESETS.find((km) => Math.abs(area.radiusKm - km) < 0.01)?.toString() ?? ''
                }
                onValueChange={(v) => v && onRadiusChange(Number(v))}
                className="gap-0.5"
              >
                {RADIUS_PRESETS.map((km) => (
                  <ToggleGroupItem
                    key={km}
                    value={km.toString()}
                    size="sm"
                    className="h-6 min-w-8 px-1.5 text-[10px] font-semibold tabular-nums hover:bg-accent hover:text-accent-foreground"
                    aria-label={`${km} km`}
                  >
                    {km}
                  </ToggleGroupItem>
                ))}
                <span className="ml-1 self-center text-[10px] text-muted-foreground">km</span>
              </ToggleGroup>
            )}
          </div>
        )}
      </div>

      {/* ── Drawing hint capsule (bottom-center) ── */}
      {drawMode !== 'none' && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
          <Badge
            variant="outline"
            className={cn(
              'gap-2 rounded-full border-(--amber)/60 bg-background/95 px-3.5 py-1.5 text-[11px] font-medium shadow-md backdrop-blur-sm',
            )}
          >
            <MousePointerClick className="h-3.5 w-3.5 text-(--amber-ink)" strokeWidth={1.75} />
            {drawMode === 'radius'
              ? t('map.radiusHint', 'Click the map to set the center')
              : t('map.polygonHint', 'Click to add points · double-click to finish')}
          </Badge>
        </div>
      )}
    </TooltipProvider>
  )
}
