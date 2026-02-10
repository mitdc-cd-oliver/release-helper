import { useEffect, useState } from 'react'
import type { TaskItem, TaskStatus } from '../../config/releaseTasks'

type ChecklistProps = {
  items: TaskItem[]
  onMove: (taskId: string, status: TaskStatus) => void
  parentTitleById: Record<string, string>
  allowDoneWithIncompleteChildrenById: Record<string, boolean>
}

const STATUS_LABELS: TaskStatus[] = [
  'Not started',
  'In progress',
  'Done',
]

const STATUS_TITLES: Record<TaskStatus, string> = {
  'In progress': 'In Progress',
  'Not started': 'Not Started',
  Done: 'Done',
}

export default function Checklist({
  items,
  onMove,
  parentTitleById,
  allowDoneWithIncompleteChildrenById,
}: ChecklistProps) {
  const [activeStatus, setActiveStatus] = useState<TaskStatus | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [draggingOverId, setDraggingOverId] = useState<string | null>(null)
  const [dropStatus, setDropStatus] = useState<TaskStatus | null>(null)
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
            const taskId = event.dataTransfer.getData('text/plain')
            if (taskId) {
              onMove(taskId, group.status)
            }
            setDropStatus(group.status)
            setActiveStatus(null)
            setDraggingId(null)
            setDraggingOverId(null)
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
                {draggingId ? 'Release tasks will appear here' : 'No tasks'}
              </div>
            ) : (
              group.items.map((item) => (
                <div
                  key={item.id}
                  className={`space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 transition ${
                    draggingId === item.id ? 'opacity-60 scale-[0.99]' : ''
                  } ${
                    draggingOverId === item.id
                      ? 'shadow-lg shadow-violet-500/20 -translate-y-0.5'
                      : ''
                  }`}
                  draggable={item.status !== 'Done'}
                  onDragStart={(event) => {
                    if (item.status === 'Done') {
                      return
                    }
                    event.dataTransfer.setData('text/plain', item.id)
                    setDraggingId(item.id)
                  }}
                  onDragEnter={() => {
                    setActiveStatus(group.status)
                    setDraggingOverId(item.id)
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setActiveStatus(group.status)
                  }}
                  onDragLeave={() => {
                    setDraggingOverId((current) =>
                      current === item.id ? null : current,
                    )
                  }}
                  onDragEnd={() => {
                    setDraggingId(null)
                    setActiveStatus(null)
                    setDraggingOverId(null)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {/^#\d+(?:-\d+)?\s+/.test(item.title) ? (
                          (() => {
                            const match = item.title.match(/^(#\d+(?:-\d+)?)\s+(.+)$/)
                            if (!match) {
                              return item.title
                            }
                            return (
                              <>
                                <span className="whitespace-nowrap">{match[1]}</span>
                                <span> {match[2]}</span>
                              </>
                            )
                          })()
                        ) : (
                          item.title
                        )}
                      </p>
                      {item.parentId && (
                        <p className="text-xs text-slate-500">
                          Parent: {parentTitleById[item.parentId] ?? item.parentId}
                        </p>
                      )}
                      {item.metadata?.crTicketNumber && (
                        <p className="text-xs text-violet-200">
                          CR: {item.metadata.crTicketNumber}
                        </p>
                      )}
                      {allowDoneWithIncompleteChildrenById[item.id] && (
                        <p className="text-xs text-amber-300">
                          允许直接完成（子任务可未完成）
                        </p>
                      )}
                    </div>
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
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
                    {item.status === 'Done' ? 'Locked' : 'Drag to move'}
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
