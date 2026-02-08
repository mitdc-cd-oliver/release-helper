type MainHeaderProps = {
  onStart: () => void
  statusText?: string
  isStarting?: boolean
  startLabel?: string
  startDisabled?: boolean
  weekRangeText?: string
  releaseCaptains?: string[]
  releaseCaptainInputs?: string[]
  onReleaseCaptainSave?: () => void
  releaseCaptainSaving?: boolean
  canEditCaptain?: boolean
  onReleaseCaptainInputChange?: (index: number, value: string) => void
  onReleaseCaptainAdd?: () => void
  onReleaseCaptainRemove?: (index: number) => void
  duplicateCaptainIndexes?: number[]
}

import { useState } from 'react'

export default function MainHeader({
  onStart,
  statusText,
  isStarting,
  startLabel = 'Start',
  startDisabled = false,
  weekRangeText,
  releaseCaptains = [],
  releaseCaptainInputs = [],
  onReleaseCaptainSave,
  releaseCaptainSaving = false,
  canEditCaptain = false,
  onReleaseCaptainInputChange,
  onReleaseCaptainAdd,
  onReleaseCaptainRemove,
  duplicateCaptainIndexes = [],
}: MainHeaderProps) {
  const [showCaptainForm, setShowCaptainForm] = useState(false)

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
      <div className="relative flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
        <span className="text-xs text-slate-400">Current Release Captains</span>
        <div className="flex flex-wrap items-center gap-2">
          {releaseCaptains.length === 0 ? (
            <span className="text-xs font-medium text-slate-100">Not set</span>
          ) : (
            releaseCaptains.map((name) => (
              <span
                key={name}
                className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-100"
              >
                {name}
              </span>
            ))
          )}
        </div>
        {canEditCaptain && (
          <button
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
            onClick={() => setShowCaptainForm((value: boolean) => !value)}
          >
            {releaseCaptains.length > 0 ? 'Edit' : 'Set'}
          </button>
        )}

        {canEditCaptain && showCaptainForm && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
            <div className="w-80 rounded-2xl border border-slate-800 bg-slate-950/95 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100">Release Captains</h3>
                <button
                  className="text-xs text-slate-400 hover:text-slate-200"
                  onClick={() => setShowCaptainForm(false)}
                >
                  Close
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {releaseCaptainInputs.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      className={`flex-1 rounded-md border bg-slate-900 px-3 py-2 text-sm text-slate-100 ${
                        duplicateCaptainIndexes.includes(index)
                          ? 'border-red-500/70 ring-1 ring-red-500/40'
                          : 'border-slate-800'
                      }`}
                      placeholder={`Captain ${index + 1}`}
                      value={value}
                      onChange={(event) =>
                        onReleaseCaptainInputChange?.(index, event.target.value)
                      }
                    />
                    <button
                      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-200 hover:bg-slate-800"
                      onClick={() => onReleaseCaptainRemove?.(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  className="w-full rounded-md border border-violet-400/40 bg-violet-500/10 px-3 py-2 text-xs text-violet-200 hover:bg-violet-500/20"
                  onClick={onReleaseCaptainAdd}
                >
                  Add Captain
                </button>
                {duplicateCaptainIndexes.length > 0 && (
                  <p className="text-xs text-red-300">
                    Duplicate names detected. Please make each name unique.
                  </p>
                )}
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  className="flex-1 rounded-md bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    onReleaseCaptainSave?.()
                    setShowCaptainForm(false)
                  }}
                  disabled={releaseCaptainSaving}
                >
                  {releaseCaptainSaving ? 'Saving…' : 'Save'}
                </button>
                <button
                  className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                  onClick={() => setShowCaptainForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-slate-400">
        Track the steps for this week&apos;s WRS release and keep status visible.
      </p>
    </header>
  )
}
