import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getMyProfileFn, updateMyProfileFn } from '@/modules/profile/api/profile.fn'

export const Route = createFileRoute('/_account/account/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['my-profile'], queryFn: () => getMyProfileFn() })
  const [form, setForm] = useState({
    handle: '',
    displayName: '',
    bio: '',
    email: '',
    phone: '',
    notificationsEmail: true,
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!data) return
    setForm({
      handle: data.handle ?? '',
      displayName: data.displayName ?? '',
      bio: data.bio ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      notificationsEmail: data.notificationsEmail ?? true,
    })
  }, [data])

  const update = useMutation({
    mutationFn: (input: typeof form) =>
      updateMyProfileFn({
        data: {
          ...input,
          handle: input.handle.trim() === '' ? undefined : input.handle.trim().toLowerCase(),
          displayName: input.displayName || undefined,
          bio: input.bio || undefined,
          email: input.email || undefined,
          phone: input.phone || undefined,
        },
      }),
    onSuccess: () => {
      setSaved(true)
      setError(null)
      qc.invalidateQueries({ queryKey: ['my-profile'] })
      window.setTimeout(() => setSaved(false), 2_000)
    },
    onError: (e: Error) => setError(e.message ?? 'Could not save'),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        update.mutate(form)
      }}
      className="space-y-6"
    >
      <header>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-neutral-500">How you appear to other users.</p>
      </header>

      <Card>
        <Field label="Handle (your /u/&lt;handle&gt; URL)" hint="2–40 chars, lowercase, letters/digits/-/_">
          <Input value={form.handle} onChange={(v) => setForm((f) => ({ ...f, handle: v }))} placeholder="janedoe" />
        </Field>
        <Field label="Display name">
          <Input value={form.displayName} onChange={(v) => setForm((f) => ({ ...f, displayName: v }))} />
        </Field>
        <Field label="Bio">
          <Textarea value={form.bio} onChange={(v) => setForm((f) => ({ ...f, bio: v }))} rows={4} maxLength={2000} />
        </Field>
        <Field label="Email (where notifications are sent)">
          <Input type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
        </Field>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.notificationsEmail}
            onChange={(e) => setForm((f) => ({ ...f, notificationsEmail: e.currentTarget.checked }))}
          />
          Send me email notifications for new messages and listing alerts
        </label>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-emerald-600">Saved</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
        <button
          type="submit"
          disabled={update.isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {update.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 rounded-lg border bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">{children}</div>
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}
    </label>
  )
}
const inputCls =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100'
function Input({
  value, onChange, ...rest
}: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return <input {...rest} value={value} onChange={(e) => onChange(e.currentTarget.value)} className={inputCls} />
}
function Textarea({
  value, onChange, ...rest
}: { value: string; onChange: (v: string) => void } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  return <textarea {...rest} value={value} onChange={(e) => onChange(e.currentTarget.value)} className={inputCls} />
}
