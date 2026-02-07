type MainHeaderProps = {
  onStart: () => void
  statusText?: string
  isStarting?: boolean
  startLabel?: string
  startDisabled?: boolean
  weekRangeText?: string
}

export default function MainHeader({
  onStart,
  statusText,
  isStarting,
  startLabel = 'Start',
  startDisabled = false,
  weekRangeText,
}: MainHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-2">
      <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
        Weekly Release Checklist
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-slate-100">Current Release</h2>
        <button
          className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onStart}
          disabled={isStarting || startDisabled}
        >
          {isStarting ? 'Starting…' : startLabel}
        </button>
        {statusText && (
          <span className="text-xs text-slate-400">{statusText}</span>
        )}
      </div>
      {weekRangeText && (
        <p className="text-xs text-slate-400">{weekRangeText}</p>
      )}
      <p className="text-sm text-slate-400">
        Track the steps for this week&apos;s WRS release and keep status visible.
      </p>
    </header>
  )
}
