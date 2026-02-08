export type TaskStatus = 'Not started' | 'In progress' | 'Done'

export type TaskRequirement = {
  type: 'cr-ticket'
  label: string
  link: string
}

export type TaskDefinition = {
  id: string
  title: string
  defaultStatus?: TaskStatus
  requirement?: TaskRequirement
  onInProgressChildren?: Array<Pick<TaskDefinition, 'id' | 'title'>>
}

export type TaskItem = {
  id: string
  title: string
  status: TaskStatus
  parentId?: string
  metadata?: {
    crTicketNumber?: string
    crTicketLink?: string
    changeType?: 'Standard-BAU' | 'Normal-Minor' | 'Normal-Medium'
    mtpRequired?: boolean
    scheduledReleaseLink?: string
    readinessTicketNumber?: string
    readinessTicketLink?: string
  }
}

import { STANDARD_CHANGE_REQUEST } from './releaseLinks'

export const taskDefinitions: TaskDefinition[] = [
  {
    id: 'create-cr',
    title: '#1 Create CR(Change Request)',
    requirement: {
      type: 'cr-ticket',
      label: 'CR Ticket Number',
      link: STANDARD_CHANGE_REQUEST.url,
    },
    onInProgressChildren: [
      {
        id: 'create-cr-authorize',
        title: '#1-1 Move CR to Authorize state before 12pm on Tuesday',
      },
      {
        id: 'create-cr-cab',
        title: '#1-2 Join CAB meeting on Thursday 10:00 AM',
      },
      {
        id: 'create-cr-mtp',
        title: '#1-3 MTP',
      },
    ],
  },
  {
    id: 'create-readiness-ticket',
    title: '#2 Create Readiness Ticket',
    onInProgressChildren: [
      { id: 'readiness-uat', title: '#2-1 UAT' },
      { id: 'readiness-nft', title: '#2-2 NFT' },
    ],
  },
  {
    id: 'update-release-coordinator-roster',
    title: '#3 Update Release Coordinator Roster',
    onInProgressChildren: [
      { id: 'roster-uat-meeting', title: '#3-1 UAT Meeting on Tuesday 10:00 AM' },
      { id: 'roster-kt-meeting', title: '#3-2 KT Meeting on Tuesday 4:00 PM' },
      { id: 'roster-release-approval-email', title: '#3-3 Send require release approval email' },
      { id: 'roster-piv-approval-email', title: '#3-4 Send require PIV approval email' },
    ],
  },
]

export const buildDefaultTasks = (): TaskItem[] =>
  taskDefinitions.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.defaultStatus ?? 'Not started',
  }))

export const getTaskDefinition = (taskId: string) =>
  taskDefinitions.find((task) => task.id === taskId)
