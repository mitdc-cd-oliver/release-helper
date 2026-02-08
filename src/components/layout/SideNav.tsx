type SideNavProps = {
  activeView: 'current' | 'history'
  onSelectView: (view: 'current' | 'history') => void
}

export default function SideNav({ activeView, onSelectView }: SideNavProps) {
  return (
    <aside className="w-56 shrink-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-6">
        <h1 className="text-lg font-semibold tracking-tight text-violet-100">release-helper</h1>
        <p className="text-xs text-slate-400">Weekly WRS release</p>
      </div>

      <nav className="space-y-2 text-sm">
        <button
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
            activeView === 'current'
              ? 'bg-violet-600/20 text-violet-100 ring-1 ring-violet-500/40'
              : 'text-slate-400 hover:bg-slate-800/60'
          }`}
          onClick={() => onSelectView('current')}
        >
          <span>Current</span>
          <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-violet-200">
            Active
          </span>
        </button>
        <button
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
            activeView === 'history'
              ? 'bg-violet-600/20 text-violet-100 ring-1 ring-violet-500/40'
              : 'text-slate-400 hover:bg-slate-800/60'
          }`}
          onClick={() => onSelectView('history')}
        >
          <span>History</span>
          <span className="text-[10px] uppercase tracking-wide">Browse</span>
        </button>
        <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-400 hover:bg-slate-800/60">
          <span>Announcements</span>
          <span className="text-[10px] uppercase tracking-wide">Soon</span>
        </button>
      </nav>
    </aside>
  )
}
