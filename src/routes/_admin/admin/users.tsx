/**
 * Admin → users.
 *
 * Lists known user_profiles rows (anyone who has signed in at least once) and
 * lets admins ban / unban accounts. Banning is delegated to `banUserFn`, which
 * also archives all of the user's listings.
 */
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { z } from 'zod'
import { desc, ilike, or } from 'drizzle-orm'
import { loadDb } from '@/shared/lib/db/load'
import { userProfiles } from '@/shared/lib/db/schema'
import { requireAdmin } from '@/shared/lib/auth/guards'
import { banUserFn } from '@/modules/admin/api/moderation.fn'

const listUsersFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ q: z.string().max(100).optional() }).optional())
  .handler(async ({ data }) => {
    await requireAdmin()
    const db = await loadDb()
    const query = data?.q?.trim()
    const rows = await db
      .select({
        userId: userProfiles.userId,
        handle: userProfiles.handle,
        displayName: userProfiles.displayName,
        email: userProfiles.email,
        role: userProfiles.role,
        bannedAt: userProfiles.bannedAt,
        bannedReason: userProfiles.bannedReason,
        createdAt: userProfiles.createdAt,
      })
      .from(userProfiles)
      .where(
        query
          ? or(
              ilike(userProfiles.handle, `%${query}%`),
              ilike(userProfiles.displayName, `%${query}%`),
              ilike(userProfiles.email, `%${query}%`),
              ilike(userProfiles.userId, `%${query}%`),
            )
          : undefined,
      )
      .orderBy(desc(userProfiles.createdAt))
      .limit(200)
    return rows
  })

export const Route = createFileRoute('/_admin/admin/users')({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [committedQ, setCommittedQ] = useState('')

  const users = useQuery({
    queryKey: ['admin-users', committedQ],
    queryFn: () => listUsersFn({ data: { q: committedQ || undefined } }),
  })

  const ban = useMutation({
    mutationFn: (input: Parameters<typeof banUserFn>[0]['data']) =>
      banUserFn({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium">Users</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setCommittedQ(q.trim())
          }}
          className="flex items-center gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            placeholder="Search by handle, name, email, id…"
            className="w-72 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                  Loading…
                </td>
              </tr>
            )}
            {users.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                  No users.
                </td>
              </tr>
            )}
            {users.data?.map((u) => {
              const banned = Boolean(u.bannedAt)
              return (
                <tr key={u.userId} className="border-b align-top last:border-b-0 dark:border-neutral-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.displayName ?? u.handle ?? '—'}</div>
                    <div className="text-xs text-neutral-500">{u.handle ? `@${u.handle}` : u.userId}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{u.email ?? '—'}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">
                    {banned ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        banned
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {banned ? (
                      <button
                        type="button"
                        onClick={() =>
                          ban.mutate({ userId: u.userId, reason: '', banned: false })
                        }
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const reason = prompt('Reason for ban?') ?? ''
                          if (reason.trim().length > 0) {
                            ban.mutate({ userId: u.userId, reason: reason.trim(), banned: true })
                          }
                        }}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
