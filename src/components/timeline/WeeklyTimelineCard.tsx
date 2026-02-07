type WeeklyTimelineCardProps = {
  isInWindow: boolean
  progressPercent: number
  warnRemaining: boolean
}

export default function WeeklyTimelineCard({
  isInWindow,
  progressPercent,
  warnRemaining,
}: WeeklyTimelineCardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/40 p-4 ${
        isInWindow ? '' : 'opacity-50'
      }`}
    >
      <h3 className="text-sm font-semibold text-violet-200">Weekly Timeline</h3>
      <p className="mt-2 text-xs text-slate-400">Mon 09:00 → Thu 24:00</p>
      {isInWindow ? (
        <div className="mt-3">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={warnRemaining ? 'bg-red-500/80' : 'bg-violet-500'}
              style={{ width: `${progressPercent}%` }}
            />
            <div className="bg-slate-700" style={{ width: `${100 - progressPercent}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">{progressPercent}% elapsed</p>
        </div>
      ) : (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800" />
          <p className="mt-2 text-xs text-slate-500">Outside active window</p>
        </div>
      )}
    </div>
  )
}
