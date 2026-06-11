import { formatDate } from './helpers'

export function exportCSV(moods, sleepLogs, hydrationLogs, breathingSessions) {
  const dateMap = {}
  const addEntry = (date, type, val) => {
    if (!dateMap[date]) dateMap[date] = { mood: null, sleep: 0, hydration: 0, mindful: 0 }
    if (type === 'mood') dateMap[date].mood = val
    if (type === 'sleep') dateMap[date].sleep += val
    if (type === 'hydration') dateMap[date].hydration += val
    if (type === 'breathing') dateMap[date].mindful += val
  }
  moods?.forEach(m => addEntry(m.date, 'mood', m.value))
  sleepLogs?.filter(s => s.type === 'night').forEach(s => addEntry(s.date, 'sleep', s.hours + s.minutes / 60))
  hydrationLogs?.forEach(h => addEntry(h.date, 'hydration', h.volume * h.multiplier))
  breathingSessions?.forEach(b => addEntry(b.date, 'breathing', b.durationSeconds))
  const dates = Object.keys(dateMap).sort()
  const rows = ['Date,Avg Mood,Total Sleep (Hrs),Total Hydration (ml),Mindful Secs']
  dates.forEach(d => {
    const e = dateMap[d]
    rows.push(`${d},${e.mood || ''},${e.sleep.toFixed(1)},${e.hydration.toFixed(0)},${e.mindful}`)
  })
  download(rows.join('\n'), `OmniTracker_Export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
}

export function exportMD(journals, moods, sleepLogs, hydrationLogs, breathingSessions) {
  const avgMood = moods?.length ? (moods.reduce((s, m) => s + m.value, 0) / moods.length).toFixed(1) : 'N/A'
  const totalSleep = sleepLogs?.reduce((s, sl) => s + sl.hours + sl.minutes / 60, 0).toFixed(1) || '0'
  const totalWater = hydrationLogs?.reduce((s, h) => s + h.volume * h.multiplier, 0) / 1000 || 0
  const mindfulMins = breathingSessions?.reduce((s, b) => s + b.durationSeconds, 0) / 60 || 0
  const md = [
    `# OmniTracker Report`,
    `**Generated:** ${new Date().toLocaleString()}`,
    ``,
    `## Lifetime Summary`,
    `- **Avg Mood:** ${avgMood}/10`,
    `- **Total Sleep:** ${totalSleep}h`,
    `- **Total Water:** ${totalWater.toFixed(1)}L`,
    `- **Mindful Time:** ${mindfulMins.toFixed(0)}m`,
    `- **Journals Written:** ${journals?.length || 0}`,
    ``,
    `## Journal Entries`,
    ...(journals ? [...journals].sort((a, b) => b.timestamp - a.timestamp).map(j =>
      `### ${j.title || 'Untitled Entry'}\n*${formatDate(j.date)}*\n\n${j.body}\n\n---`
    ) : ['No journal entries.'])
  ].join('\n')
  download(md, `OmniTracker_Report_${new Date().toISOString().split('T')[0]}.md`, 'text/markdown')
}

export function exportJSON(state) {
  const json = JSON.stringify(state, null, 2)
  download(json, `omnitracker_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json')
}

function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
