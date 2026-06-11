import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function MoodTrendChart({ data, labels }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()
    const ctx = canvasRef.current.getContext('2d')
    const root = document.documentElement
    const primary = getComputedStyle(root).getPropertyValue('--primary').trim()
    const textMuted = getComputedStyle(root).getPropertyValue('--text-muted').trim()
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Mood',
          data,
          borderColor: primary || '#7aa2f7',
          backgroundColor: (primary || '#7aa2f7') + '20',
          fill: true,
          tension: 0.3,
          spanGaps: true,
          pointRadius: 4,
          pointBackgroundColor: primary || '#7aa2f7'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 10, ticks: { color: textMuted, stepSize: 2 }, grid: { color: textMuted + '20' } },
          x: { ticks: { color: textMuted }, grid: { display: false } }
        }
      }
    })
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data, labels])

  return <div className="h-48"><canvas ref={canvasRef} /></div>
}
