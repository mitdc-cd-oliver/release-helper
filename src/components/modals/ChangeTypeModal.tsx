type ChangeType = 'Standard-BAU' | 'Normal-Minor' | 'Normal-Medium'

type ChangeTypeModalProps = {
  open: boolean
  value: ChangeType | ''
  options: string[]
  onChange: (value: ChangeType) => void
  onToggleOption: (option: string) => void
  onCancel: () => void
  onConfirm: () => void
}

const CHANGE_TYPES: ChangeType[] = ['Standard-BAU', 'Normal-Minor', 'Normal-Medium']

export default function ChangeTypeModal({
  open,
  value,
  options,
  onChange,
  onToggleOption,
  onCancel,
  onConfirm,
}: ChangeTypeModalProps) {
  if (!open) {
    return null
  }

  const showOptions = value === 'Normal-Minor' || value === 'Normal-Medium'

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="w-[26rem] rounded-2xl border border-slate-800 bg-slate-950/95 p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">Select Change Type</h3>
          <button className="text-xs text-slate-400 hover:text-slate-200" onClick={onCancel}>
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {CHANGE_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
              <input
                type="radio"
                className="h-3.5 w-3.5 accent-violet-500"
                name="changeType"
                value={type}
                checked={value === type}
                onChange={() => onChange(type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>

        {showOptions && (
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300">Change Scope</p>
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-200">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-violet-500"
                checked={options.includes('MTP')}
                onChange={() => onToggleOption('MTP')}
              />
              <span>MTP</span>
            </label>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            className="flex-1 rounded-md bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onConfirm}
            disabled={!value}
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
