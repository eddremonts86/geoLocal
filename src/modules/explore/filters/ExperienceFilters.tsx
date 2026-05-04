import { useTranslation } from 'react-i18next'
import { Toggle } from '@/components/ui/toggle'
import { EXPERIENCE_SUBCATEGORIES } from '@/modules/listings/model/types'

interface ExperienceFiltersProps {
  subCategory: string[] | null
  durationMin: number | null
  durationMax: number | null
  groupMax: number | null
  minAgeMax: number | null
  languages: string[] | null
  difficulty: 'easy' | 'moderate' | 'hard' | null
  onSubCategoryChange: (val: string[] | null) => void
  onDurationMinChange: (val: number | null) => void
  onDurationMaxChange: (val: number | null) => void
  onGroupMaxChange: (val: number | null) => void
  onMinAgeMaxChange: (val: number | null) => void
  onLanguagesChange: (val: string[] | null) => void
  onDifficultyChange: (val: 'easy' | 'moderate' | 'hard' | null) => void
}

const PILL_CLASS =
  'rounded-full px-4 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background'

const SUBCATEGORY_LABELS: Record<string, string> = {
  outdoor: 'Outdoor',
  culinary: 'Culinary',
  cultural: 'Cultural',
  wellness: 'Wellness',
  art: 'Art & Craft',
  sports: 'Sports',
  nightlife: 'Nightlife',
  guided_tour: 'Guided Tour',
}

const DURATION_OPTIONS = [
  { label: '≤ 2h', value: 2 },
  { label: '≤ 4h', value: 4 },
  { label: 'Half day', value: 6 },
  { label: 'Full day', value: 12 },
]

const GROUP_OPTIONS = [
  { label: '≤ 2', value: 2 },
  { label: '≤ 5', value: 5 },
  { label: '≤ 10', value: 10 },
  { label: '20+', value: 20 },
]

const AGE_OPTIONS = [
  { label: 'Family (0+)', value: 0 },
  { label: 'Teens+ (12)', value: 12 },
  { label: 'Adults (18+)', value: 18 },
]

const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'da', label: 'Dansk' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'sv', label: 'Svenska' },
  { value: 'no', label: 'Norsk' },
]

const DIFFICULTY_OPTIONS: { value: 'easy' | 'moderate' | 'hard'; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hard', label: 'Challenging' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

export function ExperienceFilters({
  subCategory, durationMin, durationMax, groupMax, minAgeMax, languages, difficulty,
  onSubCategoryChange, onDurationMinChange, onDurationMaxChange, onGroupMaxChange,
  onMinAgeMaxChange, onLanguagesChange, onDifficultyChange,
}: ExperienceFiltersProps) {
  const { t } = useTranslation()

  function toggleSubCategory(val: string) {
    const current = subCategory ?? []
    const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
    onSubCategoryChange(next.length > 0 ? next : null)
  }

  function toggleLanguage(val: string) {
    const current = languages ?? []
    const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
    onLanguagesChange(next.length > 0 ? next : null)
  }

  return (
    <div className="space-y-6">
      {/* Sub-category */}
      <div>
        <SectionLabel>{t('filters.experienceType', 'Experience type')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_SUBCATEGORIES.map((sub) => (
            <Toggle
              key={sub}
              pressed={subCategory?.includes(sub) ?? false}
              onPressedChange={() => toggleSubCategory(sub)}
              variant="outline"
              className={PILL_CLASS}
            >
              {SUBCATEGORY_LABELS[sub] ?? sub}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <SectionLabel>{t('filters.durationMin', 'Minimum duration')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <Toggle
              key={`min-${opt.value}`}
              pressed={durationMin === opt.value}
              onPressedChange={() => onDurationMinChange(durationMin === opt.value ? null : opt.value)}
              variant="outline"
              className={PILL_CLASS}
            >
              {opt.label}+
            </Toggle>
          ))}
        </div>
        <SectionLabel>{t('filters.durationMax', 'Maximum duration')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <Toggle
              key={`max-${opt.value}`}
              pressed={durationMax === opt.value}
              onPressedChange={() => onDurationMaxChange(durationMax === opt.value ? null : opt.value)}
              variant="outline"
              className={PILL_CLASS}
            >
              {opt.label}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Group size */}
      <div>
        <SectionLabel>{t('filters.groupSize', 'Max group size')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {GROUP_OPTIONS.map((opt) => (
            <Toggle
              key={opt.value}
              pressed={groupMax === opt.value}
              onPressedChange={() => onGroupMaxChange(groupMax === opt.value ? null : opt.value)}
              variant="outline"
              className={PILL_CLASS}
            >
              {opt.label}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Age */}
      <div>
        <SectionLabel>{t('filters.age', 'Age requirement')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {AGE_OPTIONS.map((opt) => (
            <Toggle
              key={opt.value}
              pressed={minAgeMax === opt.value}
              onPressedChange={() => onMinAgeMaxChange(minAgeMax === opt.value ? null : opt.value)}
              variant="outline"
              className={PILL_CLASS}
            >
              {opt.label}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <SectionLabel>{t('filters.languages', 'Languages')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map(({ value, label }) => (
            <Toggle
              key={value}
              pressed={!!languages?.includes(value)}
              onPressedChange={() => toggleLanguage(value)}
              variant="outline"
              className={PILL_CLASS}
            >
              {label}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <SectionLabel>{t('filters.difficulty', 'Difficulty')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_OPTIONS.map(({ value, label }) => (
            <Toggle
              key={value}
              pressed={difficulty === value}
              onPressedChange={() => onDifficultyChange(difficulty === value ? null : value)}
              variant="outline"
              className={PILL_CLASS}
            >
              {label}
            </Toggle>
          ))}
        </div>
      </div>
    </div>
  )
}
