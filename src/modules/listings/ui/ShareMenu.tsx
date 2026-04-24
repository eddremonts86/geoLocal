import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Share2, Link as LinkIcon, Mail, Check, MessageCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export interface ShareMenuProps {
  /** Absolute URL to share. If omitted, uses window.location.href. */
  url?: string
  /** Title used for native share + some targets. */
  title: string
  /** Optional short description used by native share + email body. */
  text?: string
  /**
   * Render override for the trigger button. Receives the click handler
   * that opens native share (mobile) or the dropdown (desktop).
   */
  className?: string
  ariaLabel?: string
}

/**
 * Share control with:
 * - Native `navigator.share()` on supported clients (mobile Safari/Chrome).
 * - Dropdown fallback with copy link + social targets.
 *
 * Safe on SSR — guards all `window`/`navigator` access.
 */
export function ShareMenu({ url, title, text, className, ariaLabel }: ShareMenuProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const resolveUrl = useCallback(() => {
    if (url) return url
    if (typeof window !== 'undefined') return window.location.href
    return ''
  }, [url])

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'

  const handleTriggerClick = useCallback(
    async (e: React.MouseEvent) => {
      if (!canNativeShare) return // let dropdown open
      e.preventDefault()
      try {
        await navigator.share({ title, text, url: resolveUrl() })
      } catch {
        // User cancelled or share failed — fall back to dropdown
        setOpen(true)
      }
    },
    [canNativeShare, resolveUrl, text, title],
  )

  const handleCopy = useCallback(async () => {
    const shareUrl = resolveUrl()
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard permission denied — fallback to prompt selection
      if (typeof window !== 'undefined') window.prompt(t('share.copyFallback', 'Copy this link'), shareUrl)
    }
  }, [resolveUrl, t])

  const openTarget = (href: string) => {
    if (typeof window !== 'undefined') window.open(href, '_blank', 'noopener,noreferrer')
  }

  const shareUrl = typeof window !== 'undefined' ? resolveUrl() : ''
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedText = encodeURIComponent(text ?? title)

  const triggerBtn = (
    <Button
      variant="ghost"
      size="icon"
      className={className ?? 'rounded-none'}
      style={{ color: 'var(--ink-3)' }}
      aria-label={ariaLabel ?? t('share.label', 'Share')}
      onClick={canNativeShare ? handleTriggerClick : undefined}
    >
      <Share2 className="h-4 w-4" strokeWidth={1.5} />
    </Button>
  )

  // On clients with native share, skip the dropdown entirely for the happy path.
  if (canNativeShare) return triggerBtn

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{triggerBtn}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-none">
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleCopy() }}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" strokeWidth={1.5} style={{ color: 'var(--amber-ink)' }} />
              <span>{t('share.copied', 'Link copied')}</span>
            </>
          ) : (
            <>
              <LinkIcon className="mr-2 h-4 w-4" strokeWidth={1.5} />
              <span>{t('share.copyLink', 'Copy link')}</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            openTarget(`https://wa.me/?text=${encodedText}%20${encodedUrl}`)
          }}
        >
          <MessageCircle className="mr-2 h-4 w-4" strokeWidth={1.5} />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            openTarget(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`)
          }}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>X (Twitter)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            openTarget(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)
          }}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.3-1.5 1.6-1.5H17V4.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.1V10.5H8v3h2.5V21z" />
          </svg>
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            openTarget(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            )
          }}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
          <span>LinkedIn</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            openTarget(`mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`)
          }}
        >
          <Mail className="mr-2 h-4 w-4" strokeWidth={1.5} />
          <span>{t('share.email', 'Email')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
