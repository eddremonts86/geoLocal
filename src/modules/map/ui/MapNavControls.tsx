import { Plus, Minus, Compass, LocateFixed } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MapNavControlsProps {
  /** Current map bearing in degrees (0 = north). Compass icon rotates to match. */
  bearing: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetNorth: () => void
  onGeolocate: () => void
}

/**
 * Vertical pill of map navigation controls. Shares the exact chrome of
 * MapToolbar / MapStyleSwitcher so all three feel like one family:
 *   rounded-md + border + bg-background/95 + shadow-sm + backdrop-blur-sm + p-1
 * Buttons are ghost, h-8 w-8, icon 3.5 with strokeWidth 1.75.
 */
export function MapNavControls({
  bearing,
  onZoomIn,
  onZoomOut,
  onResetNorth,
  onGeolocate,
}: MapNavControlsProps) {
  const { t } = useTranslation()

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-background/95 p-1 shadow-sm backdrop-blur-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onZoomIn}
              className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
              aria-label={t('map.zoomIn', 'Zoom in')}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{t('map.zoomIn', 'Zoom in')}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onZoomOut}
              className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
              aria-label={t('map.zoomOut', 'Zoom out')}
            >
              <Minus className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{t('map.zoomOut', 'Zoom out')}</TooltipContent>
        </Tooltip>

        <Separator orientation="horizontal" className="w-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onResetNorth}
              className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
              aria-label={t('map.resetNorth', 'Reset north')}
            >
              <Compass
                className="h-3.5 w-3.5 transition-transform duration-200"
                strokeWidth={1.75}
                style={{ transform: `rotate(${-bearing}deg)` }}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{t('map.resetNorth', 'Reset north')}</TooltipContent>
        </Tooltip>

        <Separator orientation="horizontal" className="w-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onGeolocate}
              className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
              aria-label={t('map.geolocate', 'My location')}
            >
              <LocateFixed className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{t('map.geolocate', 'My location')}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
