import { Layers, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { MAP_STYLES, type MapStyleId } from './map-styles'

interface MapStyleSwitcherProps {
  value: MapStyleId
  onChange: (id: MapStyleId) => void
  /** Tooltip side — aligned to the control's placement. Defaults to 'bottom'. */
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
  /** Popover side — where the thumbnails panel opens. Defaults to 'bottom'. */
  popoverSide?: 'top' | 'right' | 'bottom' | 'left'
}

/**
 * Icon-only basemap switcher designed to live INSIDE MapToolbar's pill
 * (no outer chrome of its own). The parent provides the border + background.
 */
export function MapStyleSwitcher({
  value,
  onChange,
  tooltipSide = 'bottom',
  popoverSide = 'bottom',
}: MapStyleSwitcherProps) {
  const { t } = useTranslation()

  return (
    <TooltipProvider delayDuration={300}>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 px-2.5 hover:bg-accent hover:text-accent-foreground"
                aria-label={t('map.layers', 'Layers')}
              >
                <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="hidden md:inline text-xs">{t('map.layers', 'Layers')}</span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side={tooltipSide}>{t('map.style', 'Map style')}</TooltipContent>
        </Tooltip>

        <PopoverContent side={popoverSide} align="start" sideOffset={8} className="w-56 p-2">
          <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('map.basemap', 'Basemap')}
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {MAP_STYLES.map((s) => {
              const active = s.id === value
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onChange(s.id)}
                    className={cn(
                      'group relative flex w-full flex-col overflow-hidden rounded-md border bg-background text-left transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active
                        ? 'border-primary ring-1 ring-primary'
                        : 'border-border hover:border-primary/50',
                    )}
                    aria-pressed={active}
                    aria-label={s.label}
                  >
                    <div
                      className="h-14 w-full bg-muted bg-cover bg-center"
                      style={{ backgroundImage: `url("${s.preview}")` }}
                    />
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="text-xs font-medium">{t(`map.styles.${s.id}`, s.label)}</span>
                      {active && <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.25} />}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}
