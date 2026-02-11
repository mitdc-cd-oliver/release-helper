type EmailTemplateData = {
  releaseWeekText: string
  csvText: string
  releaseThursdayYYYYMMDD: string
  releaseThursdayMMM_D_YYYY: string
}

export const getThisWeekThursdayPlaceholders = (baseDate: Date) => {
  const day = baseDate.getDay()
  const diffToMonday = (day + 6) % 7
  const monday = new Date(baseDate)
  monday.setDate(baseDate.getDate() - diffToMonday)
  monday.setHours(0, 0, 0, 0)
  const thursday = new Date(monday)
  thursday.setDate(monday.getDate() + 3)

  const pad = (value: number) => String(value).padStart(2, '0')
  const releaseThursdayYYYYMMDD = `${thursday.getFullYear()}${pad(thursday.getMonth() + 1)}${pad(thursday.getDate())}`
  const releaseThursdayMMM_D_YYYY = thursday.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return {
    releaseThursdayYYYYMMDD,
    releaseThursdayMMM_D_YYYY,
  }
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const parseCsvRow = (line: string) => {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  values.push(current.trim())
  return values
}

const buildTicketsTableHtml = (csvText: string) => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length === 0) {
    return ''
  }
  const rows = lines.map((line) => parseCsvRow(line))
  const header = rows[0]
  if (header.join(',') !== 'itemLink,itemTitle,itemAssignee') {
    return '<p style="color:#dc2626; font-weight:600;">Invalid CSV header. Expected: itemLink,itemTitle,itemAssignee</p>'
  }
  const dataRows = rows.slice(1)
  const mockResultHeader = ['Tickets', 'Title', 'Assignee', 'Remarks']
  const columnWidths = ['26%', '44%', '15%', '15%']
  const headCells = mockResultHeader
    .map(
      (cell, index) =>
        `<th style="border:1px solid #e5e7eb; padding:6px 8px; text-align:left; background:#f9fafb; width:${columnWidths[index]};">${escapeHtml(cell)}</th>`,
    )
    .join('')
  const buildTable = (rowsToRender: string[][]) => {
    const bodyRows = rowsToRender
      .map(
        (row) =>
          `<tr>${row
            .map(
              (cell, index) =>
                `<td style="border:1px solid #e5e7eb; padding:6px 8px; width:${columnWidths[index]};">${escapeHtml(cell)}</td>`,
            )
            .join('')}<td style="border:1px solid #e5e7eb; padding:6px 8px; width:${columnWidths[3]};"></td></tr>`,
      )
      .join('')
    return `\n<table style="border-collapse:collapse; width:80%; font-size:12px; table-layout:fixed;">\n<colgroup>\n<col style="width:${columnWidths[0]};" />\n<col style="width:${columnWidths[1]};" />\n<col style="width:${columnWidths[2]};" />\n<col style="width:${columnWidths[3]};" />\n</colgroup>\n<thead><tr>${headCells}</tr></thead>\n<tbody>${bodyRows}</tbody>\n</table>\n`
  }

  const titleIndex = header.indexOf('itemTitle')
  const getTitle = (row: string[]) => (titleIndex >= 0 ? row[titleIndex] || '' : '')

  const hkRows = dataRows.filter((row) => getTitle(row).includes('HK'))
  const sgRows = dataRows.filter((row) => getTitle(row).includes('SG'))

  const sections: string[] = []
  if (hkRows.length > 0) {
    sections.push('<p>HK:</p>')
    sections.push(buildTable(hkRows))
  }
  if (sgRows.length > 0) {
    sections.push('<p>SG:</p>')
    sections.push(buildTable(sgRows))
  }

  if (sections.length === 0) {
    return buildTable(dataRows)
  }

  return sections.join('\n')
}

export const buildEmailContent = (templateHtml: string, data: EmailTemplateData) => {
  const ticketsTableHtml = buildTicketsTableHtml(data.csvText)
  const htmlBody = templateHtml
    .replace('{ticketsTableHtml}', ticketsTableHtml)
    .replace('{releaseThursdayYYYYMMDD}', escapeHtml(data.releaseThursdayYYYYMMDD))
    .replace('{releaseThursdayMMM_D_YYYY}', escapeHtml(data.releaseThursdayMMM_D_YYYY))
  return [
    `Subject: WRS Release — ${data.releaseWeekText}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    htmlBody,
  ].join('\n')
}

export const downloadEmailFile = (content: string, releaseWeekText: string) => {
  const safeWeek = releaseWeekText.replace(/[^\w-]+/g, '_')
  const fileName = `PIV-Email-${safeWeek}.eml`
  const blob = new Blob([content], { type: 'message/rfc822' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
