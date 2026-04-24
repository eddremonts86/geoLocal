import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentLang = mounted ? i18n.language : 'en'
  const nextLang = currentLang === 'es' ? 'en' : 'es'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => i18n.changeLanguage(nextLang)}
      aria-label={`Switch to ${nextLang === 'es' ? 'Spanish' : 'English'}`}
      className="gap-1.5 text-muted"
      suppressHydrationWarning
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium uppercase" suppressHydrationWarning>
        {currentLang}
      </span>
    </Button>
  )
}
