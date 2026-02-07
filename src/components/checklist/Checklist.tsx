import { useEffect, useState } from 'react'

type ChecklistItem = {
  title: string
  status: 'Not started' | 'In progress' | 'Done'
}

type ChecklistProps = {
  items: ChecklistItem[]
  onMove: (title: string, status: ChecklistItem['status']) => void
}

const STATUS_LABELS: Array<ChecklistItem['status']> = [
  'Not started',
  'In progress',
  'Done',
]

const STATUS_TITLES: Record<ChecklistItem['status'], string> = {
  'In progress': 'In Progress',
  'Not started': 'Not Started',
  Done: 'Done',
}

export default function Checklist({ items, onMove }: ChecklistProps) {
  const [activeStatus, setActiveStatus] = useState<ChecklistItem['status'] | null>(null)
  const [draggingTitle, setDraggingTitle] = useState<string | null>(null)
  const [draggingOverTitle, setDraggingOverTitle] = useState<string | null>(null)
  const [dropStatus, setDropStatus] = useState<ChecklistItem['status'] | null>(null)
  const grouped = STATUS_LABELS.map((status) => ({
    status,
    items: items.filter((item) => item.status === status),
  }))

  useEffect(() => {
    if (!dropStatus) {
      return
    }
    const timer = window.setTimeout(() => setDropStatus(null), 350)
    return () => window.clearTimeout(timer)
  }, [dropStatus])

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {grouped.map((group) => (
        <section
          key={group.status}
          className={`space-y-3 rounded-2xl border border-slate-800 bg-slate-950/30 p-4 transition ${
            activeStatus === group.status
              ? 'ring-2 ring-violet-400/70 shadow-[0_0_0_1px_rgba(139,92,246,0.35)] bg-gradient-to-b from-violet-500/10 via-slate-950/20 to-slate-950/30'
              : ''
          } ${
            dropStatus === group.status
              ? 'animate-[pulse_0.35s_ease-in-out]'
              : ''
          }`}
          onDragOver={(event) => {
            event.preventDefault()
            setActiveStatus(group.status)
          }}
          onDragEnter={() => setActiveStatus(group.status)}
          onDragLeave={(event) => {
            const nextTarget = event.relatedTarget as Node | null
            if (nextTarget && event.currentTarget.contains(nextTarget)) {
              return
            }
            setActiveStatus((current) => (current === group.status ? null : current))
          }}
          onDrop={(event) => {
            const title = event.dataTransfer.getData('text/plain')
            if (title) {
              onMove(title, group.status)
            }
            setDropStatus(group.status)
            setActiveStatus(null)
            setDraggingTitle(null)
            setDraggingOverTitle(null)
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              {STATUS_TITLES[group.status]}
            </h3>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
              {group.items.length}
            </span>
          </div>

          <div className="space-y-3">
            {activeStatus === group.status && (
              <div className="rounded-xl border border-dashed border-violet-400/70 bg-violet-500/10 px-4 py-3 text-center text-xs text-violet-200 animate-pulse">
                Drop here to move
              </div>
            )}
            {group.items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 px-4 py-6 text-center text-xs text-slate-500">
                {draggingTitle ? 'Release tasks will appear here' : 'No tasks'}
              </div>
            ) : (
              group.items.map((item) => (
                <div
                  key={item.title}
                  className={`space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 transition ${
                    draggingTitle === item.title ? 'opacity-60 scale-[0.99]' : ''
                  } ${
                    draggingOverTitle === item.title
                      ? 'shadow-lg shadow-violet-500/20 -translate-y-0.5'
                      : ''
                  }`}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', item.title)
                    setDraggingTitle(item.title)
                  }}
                  onDragEnter={() => {
                    setActiveStatus(group.status)
                    setDraggingOverTitle(item.title)
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setActiveStatus(group.status)
                  }}
                  onDragLeave={() => {
                    setDraggingOverTitle((current) =>
                      current === item.title ? null : current,
                    )
                  }}
                  onDragEnd={() => {
                    setDraggingTitle(null)
                    setActiveStatus(null)
                    setDraggingOverTitle(null)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-500">Owner: Release Captain</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.status === 'In progress'
                          ? 'bg-violet-500/20 text-violet-200'
                          : item.status === 'Done'
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Drag to move
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
