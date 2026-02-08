import { useEffect, useMemo, useState } from 'react'
import type { TaskItem, TaskStatus } from '../../config/releaseTasks'

type HistoryRelease = {
  weekStart: string
  weekEnd: string
  generatedAt: string
  releaseCaptains?: string[]
  tasks?: TaskItem[]
  releaseCoordinatorRoster?: {
    label: string
    url: string
  }
}

type HistoryEntry = {
  key: string
  data: HistoryRelease
}

const STATUS_LABELS: TaskStatus[] = ['Not started', 'In progress', 'Done']

const STATUS_TITLES: Record<TaskStatus, string> = {
  'In progress': 'In Progress',
  'Not started': 'Not Started',
  Done: 'Done',
}

const formatDate = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const getWeekRange = (now: Date) => {
  const day = now.getDay()
  const diffToMonday = (day + 6) % 7
  const start = new Date(now)
  start.setDate(now.getDate() - diffToMonday)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  }
}

const historyModules = import.meta.glob('../../historical/*.json', { eager: true }) as Record<
  string,
  { default: HistoryRelease }
>

export default function HistoryPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [captainFilter, setCaptainFilter] = useState('')
  const loadingDelayMs = Number(import.meta.env.VITE_LOADING_DELAY_MS || 0)
  const releases = useMemo(() => {
    const { startDate, endDate } = getWeekRange(new Date())
    const normalizedFilter = captainFilter.trim().toLowerCase()
    const entries: HistoryEntry[] = Object.entries(historyModules)
      .map(([key, module]) => ({ key, data: module.default }))
      .filter((entry) => entry.data?.weekStart && entry.data?.weekEnd)
      .filter((entry) => !(entry.data.weekStart === startDate && entry.data.weekEnd === endDate))
      .filter((entry) => {
        if (!normalizedFilter) {
          return true
        }
        const captains = entry.data.releaseCaptains ?? []
        return captains.some((name) => name.toLowerCase().includes(normalizedFilter))
      })
      .sort((a, b) => b.data.weekStart.localeCompare(a.data.weekStart))
    return entries
  }, [captainFilter])

  const [activeKey, setActiveKey] = useState<string | null>(releases[0]?.key ?? null)

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      setIsLoading(true)
      if (import.meta.env.DEV && loadingDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, loadingDelayMs))
      }
      if (isMounted) {
        setIsLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [loadingDelayMs])

  const activeRelease = useMemo(
    () => releases.find((entry) => entry.key === activeKey)?.data,
    [activeKey, releases],
  )

  const tasks = activeRelease?.tasks ?? []
  const grouped = STATUS_LABELS.map((status) => ({
    status,
    items: tasks.filter((task) => task.status === status),
  }))

  const crTickets = tasks
    .filter((task) => task.metadata?.crTicketNumber)
    .map((task) => ({
      id: task.id,
      number: task.metadata?.crTicketNumber ?? '',
      link: task.metadata?.crTicketLink ?? '',
      changeType: task.metadata?.changeType ?? '',
      mtpRequired: Boolean(task.metadata?.mtpRequired),
      scheduledReleaseLink: task.metadata?.scheduledReleaseLink ?? '',
    }))

  const readinessTickets = tasks
    .filter((task) => task.metadata?.readinessTicketNumber)
    .map((task) => ({
      id: task.id,
      number: task.metadata?.readinessTicketNumber ?? '',
      link: task.metadata?.readinessTicketLink ?? '',
    }))

  return (
    <div className="relative grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-950/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs text-slate-200">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400/60 border-t-transparent" />
            Loading history...
          </div>
        </div>
      )}
      <aside className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="text-sm font-semibold text-violet-200">Release History</h3>
        <div>
          <label className="text-[11px] uppercase tracking-[0.2em] text-violet-300">
            Release Captains Filter
          </label>
          <input
            type="text"
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100"
            placeholder="Type captain name"
            value={captainFilter}
            onChange={(event) => setCaptainFilter(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          {releases.map((release) => (
            <button
              key={release.key}
              className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
                activeKey === release.key
                  ? 'border-violet-400/60 bg-violet-500/10 text-violet-100'
                  : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:bg-slate-800/60'
              }`}
              onClick={() => setActiveKey(release.key)}
            >
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Week
              </div>
              <div className="mt-1 text-sm font-medium">
                {release.data.weekStart} → {release.data.weekEnd}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
          <h2 className="text-lg font-semibold text-slate-100">Release Details</h2>
          {activeRelease ? (
            <div className="mt-3 space-y-2 text-xs text-slate-300">
              <p>
                <span className="text-slate-400">Week:</span> {activeRelease.weekStart} →{' '}
                {activeRelease.weekEnd}
              </p>
              <p>
                <span className="text-slate-400">Generated:</span> {activeRelease.generatedAt}
              </p>
              <p>
                <span className="text-slate-400">Release Captains:</span>{' '}
                {activeRelease.releaseCaptains?.length
                  ? activeRelease.releaseCaptains.join(', ')
                  : 'Not set'}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">No release selected.</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
          <h3 className="text-sm font-semibold text-violet-200">Release Dashboard Info</h3>
          <div className="mt-3 space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-200">
              <span className="text-slate-400">Release Coordinator Roster:</span>{' '}
              {activeRelease?.releaseCoordinatorRoster ? (
                <a
                  className="text-violet-300 hover:text-violet-200"
                  href={activeRelease.releaseCoordinatorRoster.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {activeRelease.releaseCoordinatorRoster.label}
                </a>
              ) : (
                <span className="text-slate-400">Not available</span>
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300">Change Requests</p>
              {crTickets.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">No CR tickets available.</p>
              ) : (
                <ul className="mt-2 space-y-2 text-xs text-slate-200">
                  {crTickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400">Scheduled Release Link:</span>
                        {ticket.scheduledReleaseLink ? (
                          <a
                            className="text-violet-300 hover:text-violet-200"
                            href={ticket.scheduledReleaseLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        ) : (
                          <span className="text-slate-200">—</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400">CR:</span>
                        <a
                          className="text-violet-300 hover:text-violet-200"
                          href={ticket.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {ticket.number}
                        </a>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        Change Type: <span className="text-slate-200">{ticket.changeType || '—'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        MTP Required: <span className="text-slate-200">{ticket.mtpRequired ? 'Yes' : 'No'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300">Release Readiness</p>
              {readinessTickets.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">No readiness tickets available.</p>
              ) : (
                <ul className="mt-2 space-y-2 text-xs text-slate-200">
                  {readinessTickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
                    >
                      <span className="text-slate-400">Ticket:</span>{' '}
                      <a
                        className="text-violet-300 hover:text-violet-200"
                        href={ticket.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {ticket.number}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {grouped.map((group) => (
            <div key={group.status} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-100">{STATUS_TITLES[group.status]}</h4>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                  {group.items.length}
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-200">
                {group.items.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-slate-800 px-3 py-2 text-slate-500">
                    No tasks
                  </li>
                ) : (
                  group.items.map((item) => (
                    <li key={item.id} className="rounded-lg border border-slate-800 px-3 py-2">
                      {item.title}
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
