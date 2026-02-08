import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { buildDefaultTasks } from './src/config/releaseTasks'
import { RELEASE_COORDINATOR_ROSTER } from './src/config/releaseLinks'

const formatDate = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const formatDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const getWeekRange = (now: Date) => {
  const day = now.getDay()
  const diffToMonday = (day + 6) % 7
  const start = new Date(now)
  start.setDate(now.getDate() - diffToMonday)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  }
}

const getHistoryPattern = (root: string) => {
  const configPath = path.join(root, 'public', 'history.config.json')
  try {
    const raw = fs.readFileSync(configPath, 'utf-8')
    const parsed = JSON.parse(raw) as { pattern?: string }
    return parsed.pattern || 'history-{start}_to_{end}.json'
  } catch {
    return 'history-{start}_to_{end}.json'
  }
}

const buildHistoryFileName = (pattern: string, startDate: string, endDate: string) =>
  pattern.replace('{start}', startDate).replace('{end}', endDate)

const readJsonBody = (req: { on: (event: string, cb: (chunk: Buffer) => void) => void }, cb: (body: string) => void) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk.toString()
  })
  req.on('end', () => cb(body))
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    {
      name: 'release-history-api',
      configureServer(server) {
        server.middlewares.use('/api/history/start', (req, res, next) => {
          if (req.method !== 'POST') {
            next()
            return
          }

          const root = server.config.root ?? process.cwd()
          const historyDir = path.join(root, 'src', 'historical')
          fs.mkdirSync(historyDir, { recursive: true })

          const { startDate, endDate } = getWeekRange(new Date())
          const pattern = getHistoryPattern(root)
          const fileName = buildHistoryFileName(pattern, startDate, endDate)
          const filePath = path.join(historyDir, fileName)
          const exists = fs.existsSync(filePath)

          if (!exists) {
            const payload = {
              weekStart: startDate,
              weekEnd: endDate,
              generatedAt: formatDateTime(new Date()),
              releaseCoordinatorRoster: RELEASE_COORDINATOR_ROSTER,
              releaseCaptains: [],
              tasks: buildDefaultTasks(),
            }
            fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8')
          }

          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              path: `src/historical/${fileName}`,
              fileName,
              existed: exists,
              data,
            }),
          )
        })

        server.middlewares.use('/api/history/current', (req, res, next) => {
          if (req.method !== 'GET') {
            next()
            return
          }

          const root = server.config.root ?? process.cwd()
          const historyDir = path.join(root, 'src', 'historical')
          fs.mkdirSync(historyDir, { recursive: true })

          const { startDate, endDate } = getWeekRange(new Date())
          const pattern = getHistoryPattern(root)
          const fileName = buildHistoryFileName(pattern, startDate, endDate)
          const filePath = path.join(historyDir, fileName)
          const exists = fs.existsSync(filePath)
          const data = exists ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : null

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              path: `src/historical/${fileName}`,
              fileName,
              existed: exists,
              data,
            }),
          )
        })

        server.middlewares.use('/api/history/update', (req, res, next) => {
          if (req.method !== 'POST') {
            next()
            return
          }

          readJsonBody(req, (body) => {
            const root = server.config.root ?? process.cwd()
            const historyDir = path.join(root, 'src', 'historical')
            fs.mkdirSync(historyDir, { recursive: true })

            const { startDate, endDate } = getWeekRange(new Date())
            const pattern = getHistoryPattern(root)
            const fileName = buildHistoryFileName(pattern, startDate, endDate)
            const filePath = path.join(historyDir, fileName)
            const exists = fs.existsSync(filePath)

            const payload = exists
              ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
              : {
                  weekStart: startDate,
                  weekEnd: endDate,
                  generatedAt: formatDateTime(new Date()),
                  releaseCoordinatorRoster: RELEASE_COORDINATOR_ROSTER,
                  releaseCaptains: [],
                  tasks: buildDefaultTasks(),
                }

            try {
              const parsed = body
                ? (JSON.parse(body) as {
                    releaseCaptain?: string
                    releaseCaptains?: string[]
                    tasks?: unknown
                  })
                : {}
              if (Array.isArray(parsed.tasks)) {
                payload.tasks = parsed.tasks
              }
              if (Array.isArray(parsed.releaseCaptains)) {
                payload.releaseCaptains = parsed.releaseCaptains
                  .map((name) => name.trim())
                  .filter(Boolean)
              }
              if (typeof parsed.releaseCaptain === 'string') {
                const value = parsed.releaseCaptain.trim()
                payload.releaseCaptains = value ? [value] : []
              }
            } catch {
              // ignore parse errors
            }

            fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8')

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                path: `src/historical/${fileName}`,
                fileName,
                existed: exists,
                data: payload,
              }),
            )
          })
        })
      },
    },
  ],
})
