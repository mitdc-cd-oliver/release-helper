import WeeklyTimelineCard from '../timeline/WeeklyTimelineCard'

type RightSidebarProps = {
  isInWindow: boolean
  progressPercent: number
  warnRemaining: boolean
}

export default function RightSidebar({
  isInWindow,
  progressPercent,
  warnRemaining,
}: RightSidebarProps) {
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
          <div className="h-full w-1/5 rounded-full bg-violet-500" />
        </div>
        <p className="mt-2 text-xs text-slate-500">1 of 5 steps in progress</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="text-sm font-semibold text-violet-200">Quick Links</h3>
        <ul className="mt-3 space-y-2 text-xs text-slate-300">
          <li className="rounded-lg border border-slate-800 px-3 py-2">Release runbook</li>
          <li className="rounded-lg border border-slate-800 px-3 py-2">Release dashboard</li>
          <li className="rounded-lg border border-slate-800 px-3 py-2">Notes draft</li>
        </ul>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="text-sm font-semibold text-violet-200">Notes</h3>
        <p className="mt-2 text-xs text-slate-400">
          Add reminders, blockers, and release timing notes here.
        </p>
      </div>
    </aside>
  )
}
