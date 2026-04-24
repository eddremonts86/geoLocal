import { useState, useCallback, useEffect } from 'react'
import { m } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EDITORIAL_EASE } from '@/modules/listings/model/display'
import type { ListingAsset } from '@/modules/listings/model/types'

const PLACEHOLDER = '/img-placeholder.svg'
const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = PLACEHOLDER
  e.currentTarget.onerror = null
}

interface ListingGalleryProps {
  assets: ListingAsset[]
  title: string
}

/**
 * Editorial asymmetric gallery: one tall hero on the left, 4 thumbnails
 * arranged in a 2×2 grid on the right. Clicking any image opens a
 * full-screen lightbox navigable with keyboard (← → Esc) and swipe.
 * Layout collapses to stacked on mobile.
 */
export function ListingGallery({ assets, title }: ListingGalleryProps) {
  const { t } = useTranslation()
  const images = assets.filter((a) => a.kind === 'image')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const open = useCallback((idx: number) => setLightboxIndex(idx), [])
  const close = useCallback(() => setLightboxIndex(null), [])

  const next = useCallback(() => {
    setLightboxIndex((i) => (i == null ? null : (i + 1) % images.length))
  }, [images.length])
  const prev = useCallback(() => {
    setLightboxIndex((i) => (i == null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, next, prev, close])

  if (images.length === 0) return null

  const hero = images[0]
  const thumbs = images.slice(1, 5)
  const remaining = Math.max(0, images.length - 5)
  const currentLightbox = lightboxIndex != null ? images[lightboxIndex] : null
  const hasSingle = images.length === 1

  return (
    <>
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: EDITORIAL_EASE }}
        className={`relative grid grid-cols-1 gap-2 md:gap-2.5 ${
          hasSingle ? '' : 'md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]'
        }`}
      >
        {/* Hero */}
        <button
          type="button"
          onClick={() => open(0)}
          className={`group relative overflow-hidden bg-(--surface-2) ${
            hasSingle
              ? 'aspect-[16/9] md:aspect-[21/9] md:max-h-[560px]'
              : 'aspect-[4/5] md:aspect-auto md:h-[560px]'
          }`}
          aria-label={`${t('listing.viewPhoto', 'View photo')} 1`}
        >
          <img
            src={hero.url ?? PLACEHOLDER}
            alt={hero.altText ?? title}
            className="h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.25,1,.5,1)] group-hover:scale-[1.02]"
            loading="eager"
            onError={handleImgError}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />
          <span className="absolute bottom-3 left-3 font-mono text-[0.65rem] tabular-nums text-white/90 drop-shadow">
            01 / {String(images.length).padStart(2, '0')}
          </span>
        </button>

        {/* 2×2 thumb grid (md+) or horizontal scroll (mobile) */}
        {thumbs.length > 0 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-2 md:gap-2.5">
            {thumbs.map((img, i) => {
              const isLastWithOverflow = i === thumbs.length - 1 && remaining > 0
              const absoluteIdx = i + 1
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => open(absoluteIdx)}
                  className="group relative aspect-[4/3] overflow-hidden bg-(--surface-2) md:aspect-auto"
                  aria-label={`${t('listing.viewPhoto', 'View photo')} ${absoluteIdx + 1}`}
                >
                  <img
                    src={img.url ?? PLACEHOLDER}
                    alt={img.altText ?? ''}
                    className="h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.25,1,.5,1)] group-hover:scale-[1.04]"
                    loading="lazy"
                    onError={handleImgError}
                  />
                  {isLastWithOverflow && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 backdrop-blur-[2px] text-white">
                      <Expand className="h-5 w-5" strokeWidth={1.5} />
                      <span className="font-display text-xl font-medium tabular-nums leading-none">
                        +{remaining}
                      </span>
                      <span className="meta-label text-[0.6rem] text-white/80">
                        {t('listing.viewAll', 'View all')}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Floating "View all N" pill — bottom right */}
        <button
          type="button"
          onClick={() => open(0)}
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-(--surface-0)/95 px-3.5 py-2 text-xs font-medium text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-(--surface-0) md:bottom-4 md:right-4"
          style={{ border: '1px solid var(--line-2)' }}
        >
          <Expand className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="meta-label" style={{ color: 'var(--ink-2)' }}>
            {t('listing.allPhotos', 'All photos')} · {String(images.length).padStart(2, '0')}
          </span>
        </button>
      </m.div>

      {/* Lightbox */}
      <Dialog open={lightboxIndex != null} onOpenChange={(v) => !v && close()}>
        <DialogContent className="h-[100svh] max-w-none rounded-none border-none bg-black/95 p-0 sm:h-screen md:max-w-[100vw]">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">{t('listing.galleryDesc', 'Photo gallery lightbox')}</DialogDescription>
          {currentLightbox && lightboxIndex != null && (
            <div className="relative flex h-full w-full items-center justify-center">
              <img
                src={currentLightbox.url ?? PLACEHOLDER}
                alt={currentLightbox.altText ?? title}
                className="max-h-[88vh] max-w-[92vw] object-contain"
                onError={handleImgError}
              />
              {/* Counter */}
              <div className="absolute left-4 top-4 font-mono text-xs tabular-nums text-white/85 md:left-6 md:top-6">
                {String(lightboxIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
              </div>
              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                onClick={close}
                className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 md:right-6 md:top-6"
                aria-label={t('common.close', 'Close')}
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </Button>
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prev}
                    className="absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 md:left-6"
                    aria-label={t('common.previous', 'Previous')}
                  >
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={next}
                    className="absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 md:right-6"
                    aria-label={t('common.next', 'Next')}
                  >
                    <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
                  </Button>
                </>
              )}
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="absolute inset-x-0 bottom-4 mx-auto flex max-w-[min(92vw,700px)] gap-1.5 overflow-x-auto px-4 pb-1 md:bottom-6">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden transition-opacity ${
                        i === lightboxIndex ? 'opacity-100 ring-2 ring-white' : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url ?? PLACEHOLDER}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={handleImgError}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
