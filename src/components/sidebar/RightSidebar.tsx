import { useMemo, useState } from 'react'
import WeeklyTimelineCard from '../timeline/WeeklyTimelineCard'
import type { TaskItem } from '../../config/releaseTasks'
import {
  NORMAL_CHANGE_REQUEST,
  RELEASE_COORDINATOR_ROSTER,
  RELEASE_RUNBOOK,
  STANDARD_CHANGE_REQUEST,
} from '../../config/releaseLinks'

type RightSidebarProps = {
  isInWindow: boolean
  progressPercent: number
  warnRemaining: boolean
  tasks: TaskItem[]
  currentDate: Date
}

export default function RightSidebar({
  isInWindow,
  progressPercent,
  warnRemaining,
  tasks,
  currentDate,
}: RightSidebarProps) {
  const totalTasks = tasks.length
  const doneTasks = tasks.filter((task) => task.status === 'Done').length
  const inProgressTasks = tasks.filter((task) => task.status === 'In progress').length
  const completionPercent = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0
  const [showDashboard, setShowDashboard] = useState(false)
  const crTickets = useMemo(
    () =>
      tasks
        .filter((task) => task.metadata?.crTicketNumber)
        .map((task) => ({
          id: task.id,
          number: task.metadata?.crTicketNumber ?? '',
          link: task.metadata?.crTicketLink ?? '',
          changeType: task.metadata?.changeType ?? '',
          mtpRequired: Boolean(task.metadata?.mtpRequired),
          scheduledReleaseLink: task.metadata?.scheduledReleaseLink ?? '',
        })),
    [tasks],
  )
  const readinessTickets = useMemo(
    () =>
      tasks
        .filter((task) => task.metadata?.readinessTicketNumber)
        .map((task) => ({
          id: task.id,
          number: task.metadata?.readinessTicketNumber ?? '',
          link: task.metadata?.readinessTicketLink ?? '',
        })),
    [tasks],
  )
  const reminders = useMemo(() => {
    const day = currentDate.getDay()
    const hour = currentDate.getHours()
    const list: string[] = []
    const hasMtpRequired = tasks.some((task) => Boolean(task.metadata?.mtpRequired))
    if (day === 2 && hour < 12) {
      list.push('Join UAT meeting 10:00 AM')
    }
    if (day === 2 && hour >= 12 && hour < 18) {
      list.push('Join KT Meeting 4:00 PM')
    }
    if (day === 3 && hour < 12 && hasMtpRequired) {
      list.push('Join CAB Meeting 10:00 AM')
    }
    return list
  }, [currentDate, tasks])

  return (
    <aside className="space-y-4">
      <WeeklyTimelineCard
        isInWindow={isInWindow}
        progressPercent={progressPercent}
        warnRemaining={warnRemaining}
      />

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="text-sm font-semibold text-violet-200">Release Status</h3>
        <p className="mt-2 text-xs text-slate-400">Overall progress</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-violet-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {doneTasks} of {totalTasks} tasks done · {inProgressTasks} in progress
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="text-sm font-semibold text-violet-200">Quick Links</h3>
        <ul className="mt-3 space-y-2 text-xs text-slate-300">
          <li>
            <a
              className="block w-full rounded-lg border border-slate-800 px-3 py-2 text-left hover:bg-slate-800/60"
              href={RELEASE_RUNBOOK.url}
              target="_blank"
              rel="noreferrer"
            >
              {RELEASE_RUNBOOK.label}
            </a>
          </li>
          <li>
            <button
              className="w-full rounded-lg border border-slate-800 px-3 py-2 text-left hover:bg-slate-800/60 cursor-pointer"
              onClick={() => setShowDashboard(true)}
            >
              Release dashboard
            </button>
          </li>
          <li className="rounded-lg border border-slate-800 px-3 py-2">Notes draft</li>
        </ul>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="text-sm font-semibold text-violet-200">Notes</h3>
        <p className="mt-2 text-xs text-slate-400">Reminders</p>
        {reminders.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">No reminders right now.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-xs text-slate-200">
            {reminders.map((item) => (
              <li key={item} className="rounded-lg border border-slate-800 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showDashboard && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="w-[min(92vw,56rem)] min-h-[32rem] rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Release Dashboard</h3>
              <button
                className="text-xs text-slate-400 hover:text-slate-200"
                onClick={() => setShowDashboard(false)}
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-200">
                <span className="text-slate-400">Release Coordinator Roster:</span>{' '}
                <a
                  className="text-violet-300 hover:text-violet-200"
                  href={RELEASE_COORDINATOR_ROSTER.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {RELEASE_COORDINATOR_ROSTER.label}
                </a>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-200">
                <span className="text-slate-400">CR Links:</span>{' '}
                <a
                  className="text-violet-300 hover:text-violet-200"
                  href={STANDARD_CHANGE_REQUEST.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {STANDARD_CHANGE_REQUEST.label}
                </a>
                <span className="mx-2 text-slate-500">•</span>
                <a
                  className="text-violet-300 hover:text-violet-200"
                  href={NORMAL_CHANGE_REQUEST.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {NORMAL_CHANGE_REQUEST.label}
                </a>
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300">
                Change Requests
              </p>
              {crTickets.length === 0 ? (
                <p className="text-xs text-slate-400">No CR tickets available.</p>
              ) : (
                <ul className="space-y-2 text-xs text-slate-200">
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
              <p className="pt-2 text-[11px] uppercase tracking-[0.2em] text-violet-300">
                Release Readiness
              </p>
              {readinessTickets.length === 0 ? (
                <p className="text-xs text-slate-400">No readiness tickets available.</p>
              ) : (
                <ul className="space-y-2 text-xs text-slate-200">
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
      )}
    </aside>
  )
}
