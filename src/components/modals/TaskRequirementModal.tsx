type TaskRequirementModalProps = {
  open: boolean
  title: string
  requirementLabel: string
  helperLinkLabel?: string
  helperLinkUrl?: string
  instructionLabel?: string
  instructionUrl?: string
  instructionPrefix?: string
  showInputs?: boolean
  value: string
  onChange: (value: string) => void
  linkValue: string
  onLinkChange: (value: string) => void
  mtpNumberValue?: string
  onMtpNumberChange?: (value: string) => void
  mtpLinkValue?: string
  onMtpLinkChange?: (value: string) => void
  scheduledLinkValue?: string
  onScheduledLinkChange?: (value: string) => void
  showScheduledLink?: boolean
  showMtpCrFields?: boolean
  onCancel: () => void
  onConfirm: () => void
  confirmDisabled?: boolean
}

export default function TaskRequirementModal({
  open,
  title,
  requirementLabel,
  helperLinkLabel,
  helperLinkUrl,
  instructionLabel,
  instructionUrl,
  instructionPrefix = 'Follow the instruction:',
  showInputs = true,
  value,
  onChange,
  linkValue,
  onLinkChange,
  mtpNumberValue,
  onMtpNumberChange,
  mtpLinkValue,
  onMtpLinkChange,
  scheduledLinkValue,
  onScheduledLinkChange,
  showScheduledLink = false,
  showMtpCrFields = false,
  onCancel,
  onConfirm,
  confirmDisabled = false,
}: TaskRequirementModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="w-96 rounded-2xl border border-slate-800 bg-slate-950/95 p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <button className="text-xs text-slate-400 hover:text-slate-200" onClick={onCancel}>
            Close
          </button>
        </div>
        {instructionLabel && instructionUrl && (
          <p className="mt-3 text-xs text-slate-300">
            {instructionPrefix}{' '}
            <a
              className="text-violet-300 hover:text-violet-200"
              href={instructionUrl}
              target="_blank"
              rel="noreferrer"
            >
              {instructionLabel}
            </a>
          </p>
        )}
        {showInputs && (
          <>
            <label className="mt-4 block text-[11px] uppercase tracking-[0.2em] text-violet-300">
              {requirementLabel}
            </label>
            <input
              type="text"
              className="mt-2 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              placeholder={`Enter ${requirementLabel}`}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
            <label className="mt-4 block text-[11px] uppercase tracking-[0.2em] text-violet-300">
              Ticket Link
            </label>
            <input
              type="url"
              className="mt-2 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              placeholder="https://..."
              value={linkValue}
              onChange={(event) => onLinkChange(event.target.value)}
            />
            {showMtpCrFields && (
              <>
                <label className="mt-4 block text-[11px] uppercase tracking-[0.2em] text-violet-300">
                  MTP CR Ticket Number (Optional)
                </label>
                <input
                  type="text"
                  className="mt-2 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  placeholder="Enter MTP CR Ticket Number"
                  value={mtpNumberValue ?? ''}
                  onChange={(event) => onMtpNumberChange?.(event.target.value)}
                />
                <label className="mt-4 block text-[11px] uppercase tracking-[0.2em] text-violet-300">
                  MTP CR Link (Optional)
                </label>
                <input
                  type="url"
                  className="mt-2 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  placeholder="https://..."
                  value={mtpLinkValue ?? ''}
                  onChange={(event) => onMtpLinkChange?.(event.target.value)}
                />
              </>
            )}
            {showScheduledLink && (
              <>
                <label className="mt-4 block text-[11px] uppercase tracking-[0.2em] text-violet-300">
                  Scheduled Release Link
                </label>
                <input
                  type="url"
                  className="mt-2 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  placeholder="https://..."
                  value={scheduledLinkValue}
                  onChange={(event) => onScheduledLinkChange?.(event.target.value)}
                />
              </>
            )}
            {helperLinkLabel && helperLinkUrl && (
              <a
                className="mt-2 block text-xs text-violet-300 hover:text-violet-200"
                href={helperLinkUrl}
                target="_blank"
                rel="noreferrer"
              >
                {helperLinkLabel}
              </a>
            )}
          </>
        )}
        <div className="mt-5 flex gap-2">
          <button
            className="flex-1 rounded-md bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            Confirm
          </button>
          <button
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
