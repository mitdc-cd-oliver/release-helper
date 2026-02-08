import { useMemo, useState } from 'react'

type TimeTravelPanelProps = {
  enabled: boolean
  onNowChange: (value: Date) => void
}

const formatLocalInput = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function TimeTravelPanel({ enabled, onNowChange }: TimeTravelPanelProps) {
  const [customTime, setCustomTime] = useState<string>('')
  const [showPanel, setShowPanel] = useState(false)

  const resolvedNow = useMemo(() => {
    if (!enabled || !customTime) {
      return new Date()
    }
    const parsed = new Date(customTime)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  }, [customTime, enabled])

  const inputValue = customTime || formatLocalInput(new Date())

  if (!enabled) {
    return null
  }

  return (
    <div className="fixed right-8 top-6 z-10 text-xs text-slate-200">
      <div className="relative">
        <button
          className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-medium text-violet-100 shadow-lg hover:bg-slate-800"
          onClick={() => setShowPanel((value) => !value)}
        >
          Time Travel
        </button>

        {showPanel && (
          <div className="absolute right-0 mt-3 w-72 rounded-xl border border-slate-800 bg-slate-950/90 p-4 shadow-lg backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300">Time Travel (Dev)</p>
            <label className="mt-3 block text-xs text-slate-400">Current time</label>
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-90"
              value={inputValue}
              onChange={(event) => setCustomTime(event.target.value)}
              onClick={(event) => event.currentTarget.showPicker?.()}
              onFocus={(event) => event.currentTarget.showPicker?.()}
            />
            <div className="mt-3 flex gap-2">
              <button
                className="flex-1 rounded-md bg-violet-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
                onClick={() => setCustomTime(formatLocalInput(new Date()))}
              >
                Set Now
              </button>
              <button
                className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                onClick={() => setCustomTime('')}
              >
                Use System
              </button>
            </div>
            <div className="mt-3">
              <button
                className="w-full rounded-md border border-violet-400/40 bg-violet-500/10 px-2 py-1.5 text-xs font-medium text-violet-200 hover:bg-violet-500/20"
                onClick={() => onNowChange(resolvedNow)}
              >
                Apply Time
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
