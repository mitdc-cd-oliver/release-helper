import { useEffect, useMemo, useState } from 'react'
import Checklist from './components/checklist/Checklist'
import TimeTravelPanel from './components/dev/TimeTravelPanel'
import MainHeader from './components/layout/MainHeader'
import SideNav from './components/layout/SideNav'
import RightSidebar from './components/sidebar/RightSidebar'

type ChecklistStatus = 'Not started' | 'In progress' | 'Done'
type ChecklistItem = {
  title: string
  status: ChecklistStatus
}

function App() {
  const timeTravelEnabled = Boolean(import.meta.env.VITE_TIME_TRAVEL)
  const [overrideNow, setOverrideNow] = useState<Date | null>(null)
  const now = useMemo(() => {
    if (!timeTravelEnabled || !overrideNow) {
      return new Date()
    }
    return overrideNow
  }, [overrideNow, timeTravelEnabled])
  const day = now.getDay()
  const diffToMonday = (day + 6) % 7
  const start = new Date(now)
  start.setDate(now.getDate() - diffToMonday)
  start.setHours(9, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 4)
  end.setHours(0, 0, 0, 0)

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - diffToMonday)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const formatDate = (date: Date) => {
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }
  const weekRangeText = `Week: ${formatDate(weekStart)} - ${formatDate(weekEnd)}`

  const isInWindow = now >= start && now <= end
  const durationMs = end.getTime() - start.getTime()
  const rawProgress = durationMs > 0 ? (now.getTime() - start.getTime()) / durationMs : 0
  const progress = Math.min(Math.max(rawProgress, 0), 1)
  const progressPercent = Math.round(progress * 100)
  const warnRemaining = progress >= 0.75

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { title: 'Prepare release checklist', status: 'In progress' },
    { title: 'Verify release branches are ready', status: 'Not started' },
    { title: 'Run automated validations', status: 'Not started' },
    { title: 'Draft release notes', status: 'Not started' },
    { title: 'Publish announcement', status: 'Not started' },
  ])

  const [startStatus, setStartStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  )
  const [startMessage, setStartMessage] = useState<string>('')
  const [historyExists, setHistoryExists] = useState(false)

  const handleMove = (title: string, status: ChecklistStatus) => {
    setChecklistItems((items) =>
      items.map((item) =>
        item.title === title ? { ...item, status } : item,
      ),
    )
  }

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history/current')
        if (!response.ok) {
          return
        }
        const data = (await response.json()) as { existed: boolean; path: string }
        if (data.existed) {
          setHistoryExists(true)
          setStartStatus('success')
          setStartMessage(`Loaded ${data.path}`)
        }
      } catch {
        // ignore
      }
    }

    fetchHistory()
  }, [])

  const handleStart = async () => {
    try {
      setStartStatus('loading')
      setStartMessage('')
      const response = await fetch('/api/history/start', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Request failed')
      }
      const data = (await response.json()) as { path: string; existed: boolean }
      setHistoryExists(true)
      setStartStatus('success')
      setStartMessage(
        data.existed ? `Loaded ${data.path}` : `Created ${data.path}`,
      )
    } catch {
      setStartStatus('error')
      setStartMessage('Failed to create history file')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <TimeTravelPanel enabled={timeTravelEnabled} onNowChange={setOverrideNow} />
      <div className="flex min-h-screen w-full gap-4 px-4 py-6 md:gap-6 md:px-8">
        <SideNav />

        <main className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <MainHeader
            onStart={handleStart}
            isStarting={startStatus === 'loading'}
            statusText={startMessage}
            startLabel={historyExists ? 'In Progress' : 'Start'}
            startDisabled={historyExists}
            weekRangeText={weekRangeText}
          />

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <Checklist items={[...checklistItems]} onMove={handleMove} />
            <RightSidebar
              isInWindow={isInWindow}
              progressPercent={progressPercent}
              warnRemaining={warnRemaining}
            />
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
