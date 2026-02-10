import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import Checklist from './components/checklist/Checklist'
import MainHeader from './components/layout/MainHeader'
import SideNav from './components/layout/SideNav'
import RightSidebar from './components/sidebar/RightSidebar'
import { buildDefaultTasks, getTaskDefinition, taskDefinitions } from './config/releaseTasks'
import {
  NORMAL_CHANGE_REQUEST,
  RELEASE_COORDINATOR_ROSTER,
  RELEASE_READINESS_GUIDE,
  STANDARD_CHANGE_REQUEST,
} from './config/releaseLinks'
import type { TaskItem, TaskStatus } from './config/releaseTasks'

const HistoryPage = lazy(() => import('./components/history/HistoryPage'))
const TimeTravelPanel = lazy(() => import('./components/dev/TimeTravelPanel'))
const TaskRequirementModal = lazy(() => import('./components/modals/TaskRequirementModal'))
const ChangeTypeModal = lazy(() => import('./components/modals/ChangeTypeModal'))

function App() {
  const timeTravelEnabled = (import.meta.env.VITE_ENABLE_TIME_TRAVEL || '').toLowerCase() === 'true'
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

  const [tasks, setTasks] = useState<TaskItem[]>([])

  const [startStatus, setStartStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  )
  const [startMessage, setStartMessage] = useState<string>('')
  const startStatusRef = useRef(startStatus)
  const [historyExists, setHistoryExists] = useState(false)
  const [releaseCaptains, setReleaseCaptains] = useState<string[]>([])
  const [releaseCaptainInputs, setReleaseCaptainInputs] = useState<string[]>([''])
  const [releaseCaptainSaving, setReleaseCaptainSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [requirementModal, setRequirementModal] = useState<
    | {
        taskId: string
        status: TaskStatus
        requirementLabel: string
        helperLinkLabel?: string
        helperLinkUrl?: string
        instructionLabel?: string
        instructionUrl?: string
        instructionPrefix?: string
        metadataKey: 'cr' | 'readiness' | 'info'
        showInputs?: boolean
      }
    | null
  >(null)
  const [requirementValue, setRequirementValue] = useState('')
  const [requirementLinkValue, setRequirementLinkValue] = useState('')
  const [mtpCrTicketNumber, setMtpCrTicketNumber] = useState('')
  const [mtpCrTicketLink, setMtpCrTicketLink] = useState('')
  const [scheduledReleaseLinkValue, setScheduledReleaseLinkValue] = useState('')
  const [activeView, setActiveView] = useState<'current' | 'history'>('current')
  const [changeTypeModalOpen, setChangeTypeModalOpen] = useState(false)
  const [selectedChangeType, setSelectedChangeType] = useState<
    'Standard-BAU' | 'Normal-Minor' | 'Normal-Medium' | ''
  >('')
  const [changeTypeOptions, setChangeTypeOptions] = useState<string[]>([])
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const loadingDelayMs = Number(import.meta.env.VITE_LOADING_DELAY_MS || 0)

  const persistTasks = async (nextTasks: TaskItem[]) => {
    try {
      await fetch('/api/history/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: nextTasks }),
      })
    } catch {
      setStartStatus('error')
      setStartMessage('Failed to update tasks')
    }
  }

  const ensureChildrenForTask = (taskId: string, current: TaskItem[]) => {
    const definition = getTaskDefinition(taskId)
    if (!definition?.onInProgressChildren?.length) {
      return current
    }
    const existingIds = new Set(current.map((task) => task.id))
    const parentTask = current.find((task) => task.id === taskId)
    const changeType = parentTask?.metadata?.changeType
    const mtpRequired = parentTask?.metadata?.mtpRequired
    const children = definition.onInProgressChildren
      .filter((child) => {
        if (taskId !== 'create-cr' || child.id !== 'create-cr-cab') {
          return true
        }
        if (!changeType) {
          return false
        }
        return changeType !== 'Standard-BAU'
      })
      .filter((child) => {
        if (taskId !== 'create-cr' || child.id !== 'create-cr-mtp') {
          return true
        }
        return Boolean(mtpRequired)
      })
      .filter((child) => !existingIds.has(child.id))
      .map((child) => ({
        id: child.id,
        title: child.title,
        status: 'Not started' as TaskStatus,
        parentId: taskId,
      }))
    return children.length ? [...current, ...children] : current
  }

  const applyTaskStatus = (taskId: string, status: TaskStatus, metadata?: TaskItem['metadata']) => {
    const updated = tasks.map((task) =>
      task.id === taskId ? { ...task, status, metadata: metadata ?? task.metadata } : task,
    )
    const withChildren = status === 'In progress' ? ensureChildrenForTask(taskId, updated) : updated
    setTasks(withChildren)
    persistTasks(withChildren)
  }

  const handleMove = (taskId: string, status: TaskStatus) => {
    const currentTask = tasks.find((task) => task.id === taskId)
    if (!currentTask) {
      return
    }
    if (currentTask.status === 'Done') {
      return
    }
    if (currentTask.status === 'Not started' && status !== 'In progress') {
      return
    }
    if (currentTask.status === 'In progress' && status === 'Not started') {
      const withoutChildren = tasks.filter((task) => task.parentId !== currentTask.id)
      const updated = withoutChildren.map((task) =>
        task.id === currentTask.id ? { ...task, status } : task,
      )
      setTasks(updated)
      persistTasks(updated)
      return
    }
    if (currentTask.status === 'In progress' && status !== 'Done' && status !== 'Not started') {
      return
    }

    if (status === 'Done') {
      const definition = getTaskDefinition(taskId)
      const allowDoneWithIncompleteChildren = definition?.allowDoneWithIncompleteChildren ?? false
      const hasIncompleteChildren = tasks.some(
        (task) => task.parentId === currentTask.id && task.status !== 'Done',
      )
      if (hasIncompleteChildren && !allowDoneWithIncompleteChildren) {
        setStartStatus('error')
        setStartMessage('Complete all subtasks before finishing this task')
        return
      }
    }

    if (status === 'In progress') {
      const requirement = getTaskDefinition(taskId)?.requirement
      if (requirement?.type === 'cr-ticket') {
        if (taskId === 'create-cr') {
          setPendingTaskId(taskId)
          setSelectedChangeType('')
          setChangeTypeOptions([])
          setChangeTypeModalOpen(true)
          return
        }
        setRequirementValue(currentTask.metadata?.crTicketNumber || '')
        setRequirementLinkValue(currentTask.metadata?.crTicketLink || '')
        setScheduledReleaseLinkValue(currentTask.metadata?.scheduledReleaseLink || '')
        setRequirementModal({
          taskId,
          status,
          requirementLabel: requirement.label,
          helperLinkLabel: 'Create new ticket',
          helperLinkUrl: requirement.link,
          metadataKey: 'cr',
        })
        return
      }
      if (taskId === 'create-readiness-ticket') {
        setRequirementValue(currentTask.metadata?.readinessTicketNumber || '')
        setRequirementLinkValue(currentTask.metadata?.readinessTicketLink || '')
        setScheduledReleaseLinkValue('')
        setRequirementModal({
          taskId,
          status,
          requirementLabel: 'Ticket Number',
          instructionLabel: RELEASE_READINESS_GUIDE.label,
          instructionUrl: RELEASE_READINESS_GUIDE.url,
          metadataKey: 'readiness',
        })
        return
      }
      if (taskId === 'update-release-coordinator-roster') {
        setRequirementModal({
          taskId,
          status,
          requirementLabel: '',
          instructionLabel: RELEASE_COORDINATOR_ROSTER.label,
          instructionUrl: RELEASE_COORDINATOR_ROSTER.url,
          instructionPrefix: 'Go to update:',
          metadataKey: 'info',
          showInputs: false,
        })
        return
      }
    }

    applyTaskStatus(taskId, status)
  }

  const handleRequirementCancel = () => {
    setRequirementModal(null)
    setRequirementValue('')
    setRequirementLinkValue('')
    setMtpCrTicketNumber('')
    setMtpCrTicketLink('')
    setSelectedChangeType('')
    setScheduledReleaseLinkValue('')
  }

  const handleRequirementConfirm = () => {
    if (!requirementModal) {
      return
    }
    if (requirementModal.metadataKey === 'info') {
      applyTaskStatus(requirementModal.taskId, requirementModal.status)
    } else {
      const value = requirementValue.trim()
      if (!value) {
        return
      }
      const linkValue = requirementLinkValue.trim()
      if (!linkValue) {
        return
      }
      const scheduledLinkValue = scheduledReleaseLinkValue.trim()
      if (requirementModal.taskId === 'create-cr' && !scheduledLinkValue) {
        return
      }
      const trimmedMtpNumber = mtpCrTicketNumber.trim()
      const trimmedMtpLink = mtpCrTicketLink.trim()
      const mtpEnabled = changeTypeOptions.includes('MTP')
      applyTaskStatus(requirementModal.taskId, requirementModal.status, {
        ...(requirementModal.metadataKey === 'cr'
          ? {
              crTicketNumber: value,
              crTicketLink: linkValue,
              mtpCrTicketNumber: mtpEnabled ? trimmedMtpNumber || undefined : undefined,
              mtpCrTicketLink: mtpEnabled ? trimmedMtpLink || undefined : undefined,
              scheduledReleaseLink:
                requirementModal.taskId === 'create-cr' ? scheduledLinkValue : undefined,
              changeType:
                requirementModal.taskId === 'create-cr' && selectedChangeType
                  ? selectedChangeType
                  : undefined,
              mtpRequired:
                requirementModal.taskId === 'create-cr'
                  ? changeTypeOptions.includes('MTP')
                  : undefined,
            }
          : {
              readinessTicketNumber: value,
              readinessTicketLink: linkValue,
            }),
      })
    }
    setRequirementModal(null)
    setRequirementValue('')
    setRequirementLinkValue('')
    setMtpCrTicketNumber('')
    setMtpCrTicketLink('')
    setSelectedChangeType('')
    setScheduledReleaseLinkValue('')
  }

  const handleChangeTypeCancel = () => {
    setChangeTypeModalOpen(false)
    setPendingTaskId(null)
  }

  const handleChangeTypeConfirm = () => {
    if (!pendingTaskId || !selectedChangeType) {
      return
    }
    const link =
      selectedChangeType === 'Standard-BAU'
        ? STANDARD_CHANGE_REQUEST.url
        : NORMAL_CHANGE_REQUEST.url
    window.open(link, '_blank', 'noopener,noreferrer')
    if (changeTypeOptions.includes('MTP') && selectedChangeType !== 'Standard-BAU') {
      window.open(STANDARD_CHANGE_REQUEST.url, '_blank', 'noopener,noreferrer')
    }
    const requirement = getTaskDefinition(pendingTaskId)?.requirement
    if (requirement?.type === 'cr-ticket') {
      const currentTask = tasks.find((task) => task.id === pendingTaskId)
      setRequirementValue(currentTask?.metadata?.crTicketNumber || '')
      setRequirementLinkValue(currentTask?.metadata?.crTicketLink || '')
      setMtpCrTicketNumber(currentTask?.metadata?.mtpCrTicketNumber || '')
      setMtpCrTicketLink(currentTask?.metadata?.mtpCrTicketLink || '')
      setScheduledReleaseLinkValue(currentTask?.metadata?.scheduledReleaseLink || '')
      setRequirementModal({
        taskId: pendingTaskId,
        status: 'In progress',
        requirementLabel: requirement.label,
        helperLinkLabel: 'Create new ticket',
        helperLinkUrl: link,
        metadataKey: 'cr',
      })
    }
    setChangeTypeModalOpen(false)
    setPendingTaskId(null)
  }

  const handleEditCrTicket = (taskId: string) => {
    const currentTask = tasks.find((task) => task.id === taskId)
    if (!currentTask) {
      return
    }
    const requirement = getTaskDefinition(taskId)?.requirement
    if (!requirement || requirement.type !== 'cr-ticket') {
      return
    }
    const changeType = currentTask.metadata?.changeType ?? ''
    const isMtpRequired = Boolean(currentTask.metadata?.mtpRequired)
    const link =
      changeType === 'Standard-BAU' || changeType === ''
        ? STANDARD_CHANGE_REQUEST.url
        : NORMAL_CHANGE_REQUEST.url
    setSelectedChangeType(changeType)
    setChangeTypeOptions(isMtpRequired ? ['MTP'] : [])
    setRequirementValue(currentTask.metadata?.crTicketNumber || '')
    setRequirementLinkValue(currentTask.metadata?.crTicketLink || '')
    setMtpCrTicketNumber(currentTask.metadata?.mtpCrTicketNumber || '')
    setMtpCrTicketLink(currentTask.metadata?.mtpCrTicketLink || '')
    setScheduledReleaseLinkValue(currentTask.metadata?.scheduledReleaseLink || '')
    setRequirementModal({
      taskId,
      status: 'In progress',
      requirementLabel: requirement.label,
      helperLinkLabel: 'Create new ticket',
      helperLinkUrl: link,
      metadataKey: 'cr',
    })
  }

  const taskTitleById = useMemo(() => {
    const entries: Record<string, string> = {}
    tasks.forEach((task) => {
      entries[task.id] = task.title
    })
    return entries
  }, [tasks])

  const allowDoneWithIncompleteChildrenById = useMemo(() => {
    const entries: Record<string, boolean> = {}
    taskDefinitions.forEach((task) => {
      if (task.allowDoneWithIncompleteChildren) {
        entries[task.id] = true
      }
    })
    return entries
  }, [])

  useEffect(() => {
    startStatusRef.current = startStatus
  }, [startStatus])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        if (import.meta.env.DEV && loadingDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, loadingDelayMs))
        }
        const response = await fetch('/api/history/current')
        if (!response.ok) {
          return
        }
        const data = (await response.json()) as {
          existed: boolean
          path: string
          data?: {
            releaseCaptain?: string | null
            releaseCaptains?: string[]
            tasks?: TaskItem[]
          }
        }
        if (data.existed) {
          setHistoryExists(true)
          if (startStatusRef.current === 'idle') {
            setStartStatus('success')
            setStartMessage(`Loaded ${data.path}`)
          }
          const captains =
            data.data?.releaseCaptains?.length
              ? data.data.releaseCaptains
              : data.data?.releaseCaptain
                ? [data.data.releaseCaptain]
                : []
          setReleaseCaptains(captains)
          setReleaseCaptainInputs(captains.length ? captains : [''])
          if (data.data?.tasks?.length) {
            setTasks(data.data.tasks)
          } else {
            const defaults = buildDefaultTasks()
            setTasks(defaults)
            await persistTasks(defaults)
          }
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [loadingDelayMs])

  const handleStart = async () => {
    try {
      setStartStatus('loading')
      setStartMessage('')
      const response = await fetch('/api/history/start', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Request failed')
      }
      const data = (await response.json()) as {
        path: string
        existed: boolean
        data?: {
          releaseCaptain?: string | null
          releaseCaptains?: string[]
          tasks?: TaskItem[]
        }
      }
      setHistoryExists(true)
      setStartStatus('success')
      setStartMessage(
        data.existed ? `Loaded ${data.path}` : `Created ${data.path}`,
      )
      const captains =
        data.data?.releaseCaptains?.length
          ? data.data.releaseCaptains
          : data.data?.releaseCaptain
            ? [data.data.releaseCaptain]
            : []
      if (captains.length) {
        setReleaseCaptains(captains)
        setReleaseCaptainInputs(captains)
      }
      if (data.data?.tasks?.length) {
        setTasks(data.data.tasks)
      } else {
        const defaults = buildDefaultTasks()
        setTasks(defaults)
        await persistTasks(defaults)
      }
    } catch {
      setStartStatus('error')
      setStartMessage('Failed to create history file')
    }
  }

  const handleReleaseCaptainSave = async () => {
    try {
      setReleaseCaptainSaving(true)
      const trimmed = releaseCaptainInputs.map((name) => name.trim())
      const payload = trimmed.filter(Boolean)
      const normalized = payload.map((name) => name.toLowerCase())
      const unique = new Set(normalized)
      if (unique.size !== normalized.length) {
        setStartStatus('error')
        setStartMessage('Duplicate captain names are not allowed')
        return
      }
      const response = await fetch('/api/history/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseCaptains: payload }),
      })
      if (!response.ok) {
        throw new Error('Request failed')
      }
      const data = (await response.json()) as {
        data?: { releaseCaptain?: string | null; releaseCaptains?: string[] }
      }
      const captains =
        data.data?.releaseCaptains?.length
          ? data.data.releaseCaptains
          : data.data?.releaseCaptain
            ? [data.data.releaseCaptain]
            : payload
      setReleaseCaptains(captains)
      setReleaseCaptainInputs(captains.length ? captains : [''])
      setHistoryExists(true)
      setStartStatus('success')
      setStartMessage(captains.length ? 'Release captain updated' : 'Release captain cleared')
    } catch {
      setStartStatus('error')
      setStartMessage('Failed to update release captain')
    } finally {
      setReleaseCaptainSaving(false)
    }
  }

  const handleReleaseCaptainInputChange = (index: number, value: string) => {
    setReleaseCaptainInputs((inputs) =>
      inputs.map((item, idx) => (idx === index ? value : item)),
    )
  }

  const handleReleaseCaptainAdd = () => {
    setReleaseCaptainInputs((inputs) => [...inputs, ''])
  }

  const handleReleaseCaptainRemove = (index: number) => {
    setReleaseCaptainInputs((inputs) => {
      if (inputs.length <= 1) {
        return ['']
      }
      const next = inputs.filter((_, idx) => idx !== index)
      return next.length ? next : ['']
    })
  }

  const duplicateCaptainIndexes = useMemo(() => {
    const seen = new Map<string, number[]>()
    releaseCaptainInputs.forEach((value, index) => {
      const normalized = value.trim().toLowerCase()
      if (!normalized) {
        return
      }
      const current = seen.get(normalized) ?? []
      current.push(index)
      seen.set(normalized, current)
    })
    const duplicates: number[] = []
    seen.forEach((indexes) => {
      if (indexes.length > 1) {
        duplicates.push(...indexes)
      }
    })
    return duplicates
  }, [releaseCaptainInputs])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Suspense fallback={null}>
        <TimeTravelPanel enabled={timeTravelEnabled} onNowChange={setOverrideNow} />
      </Suspense>
      <div className="flex min-h-screen w-full gap-4 px-4 py-6 md:gap-6 md:px-8">
        <SideNav activeView={activeView} onSelectView={setActiveView} />

        <main className="relative flex-1 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          {activeView === 'current' ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-950/40 backdrop-blur-sm">
                  <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs text-slate-200">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400/60 border-t-transparent" />
                    Loading release data...
                  </div>
                </div>
              )}
              <MainHeader
                onStart={handleStart}
                isStarting={startStatus === 'loading'}
                statusText={startMessage}
                startLabel={historyExists ? 'In Progress' : 'Start'}
                startDisabled={historyExists}
                weekRangeText={weekRangeText}
                releaseCaptains={releaseCaptains}
                releaseCaptainInputs={releaseCaptainInputs}
                onReleaseCaptainSave={handleReleaseCaptainSave}
                releaseCaptainSaving={releaseCaptainSaving}
                canEditCaptain={historyExists}
                onReleaseCaptainInputChange={handleReleaseCaptainInputChange}
                onReleaseCaptainAdd={handleReleaseCaptainAdd}
                onReleaseCaptainRemove={handleReleaseCaptainRemove}
                duplicateCaptainIndexes={duplicateCaptainIndexes}
              />

              <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <Checklist
                  items={[...tasks]}
                  parentTitleById={taskTitleById}
                  allowDoneWithIncompleteChildrenById={allowDoneWithIncompleteChildrenById}
                  onMove={handleMove}
                  onEditCrTicket={handleEditCrTicket}
                />
                <RightSidebar
                  isInWindow={isInWindow}
                  progressPercent={progressPercent}
                  warnRemaining={warnRemaining}
                  tasks={tasks}
                  currentDate={now}
                />
              </section>
            </>
          ) : (
            <Suspense
              fallback={
                <div className="flex min-h-[18rem] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/40">
                  <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs text-slate-200">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400/60 border-t-transparent" />
                    Loading history view...
                  </div>
                </div>
              }
            >
              <HistoryPage />
            </Suspense>
          )}
        </main>
      </div>
      <Suspense fallback={null}>
        <TaskRequirementModal
          open={Boolean(requirementModal)}
          title="Additional Info Required"
          requirementLabel={requirementModal?.requirementLabel || ''}
          helperLinkLabel={requirementModal?.helperLinkLabel}
          helperLinkUrl={requirementModal?.helperLinkUrl}
          instructionLabel={requirementModal?.instructionLabel}
          instructionUrl={requirementModal?.instructionUrl}
          instructionPrefix={requirementModal?.instructionPrefix}
          showInputs={requirementModal?.showInputs}
          value={requirementValue}
          onChange={setRequirementValue}
          linkValue={requirementLinkValue}
          onLinkChange={setRequirementLinkValue}
          mtpNumberValue={mtpCrTicketNumber}
          onMtpNumberChange={setMtpCrTicketNumber}
          mtpLinkValue={mtpCrTicketLink}
          onMtpLinkChange={setMtpCrTicketLink}
          scheduledLinkValue={scheduledReleaseLinkValue}
          onScheduledLinkChange={setScheduledReleaseLinkValue}
          showScheduledLink={requirementModal?.taskId === 'create-cr'}
          showMtpCrFields={
            requirementModal?.taskId === 'create-cr' && changeTypeOptions.includes('MTP')
          }
          onCancel={handleRequirementCancel}
          onConfirm={handleRequirementConfirm}
          confirmDisabled={
            requirementModal?.showInputs !== false
              ? !requirementValue.trim() ||
                !requirementLinkValue.trim() ||
                (requirementModal?.taskId === 'create-cr' &&
                  !scheduledReleaseLinkValue.trim())
              : false
          }
        />
        <ChangeTypeModal
          open={changeTypeModalOpen}
          value={selectedChangeType}
          options={changeTypeOptions}
          onChange={setSelectedChangeType}
          onToggleOption={(option) =>
            setChangeTypeOptions((current) =>
              current.includes(option)
                ? current.filter((item) => item !== option)
                : [...current, option],
            )
          }
          onCancel={handleChangeTypeCancel}
          onConfirm={handleChangeTypeConfirm}
        />
      </Suspense>
    </div>
  )
}

export default App
