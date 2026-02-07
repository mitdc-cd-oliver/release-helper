import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const formatDate = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
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
              generatedAt: new Date().toISOString(),
              tasks: [],
            }
            fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8')
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              path: `src/historical/${fileName}`,
              fileName,
              existed: exists,
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

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              path: `src/historical/${fileName}`,
              fileName,
              existed: exists,
            }),
          )
        })
      },
    },
  ],
})
