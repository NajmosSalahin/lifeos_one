import { IconMood1, IconMood2, IconMood3, IconMood4, IconMood5, IconMood6, IconMood7, IconMood8, IconMood9, IconMood10 } from './icons'

export function calculateSleepDuration(bedTime, wakeTime, awakeMinutes) {
  if (!bedTime || !wakeTime) return { hours: 0, minutes: 0 }
  const [bh, bm] = bedTime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let bedMins = bh * 60 + bm
  let wakeMins = wh * 60 + wm
  if (wakeMins <= bedMins) wakeMins += 1440
  let diff = wakeMins - bedMins - (awakeMinutes || 0)
  diff = Math.max(diff, 0)
  return { hours: Math.floor(diff / 60), minutes: diff % 60 }
}

export function calculateHydrationGoal(profile) {
  if (!profile) return 1000
  const baseBody = (profile.weight * 35) + ((profile.height - 150) * 5)
  const tempFactor = 1 + ((profile.temp || 22) - 22) * 0.015
  const humidityFactor = 1 + ((profile.humidity || 50) - 50) * 0.005
  const goal = Math.max(Math.round(baseBody * (profile.activityLevel || 1.2) * tempFactor * humidityFactor), 1000)
  return goal
}

export function calculateStreak(doneDates, skippedDates, freezeLimit = 0) {
  const today = new Date()
  let streak = 0
  let freezesUsed = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0')
    if (doneDates.includes(dateStr)) {
      streak++
    } else if (skippedDates.includes(dateStr) && freezesUsed < freezeLimit) {
      streak++
      freezesUsed++
    } else {
      break
    }
  }
  return { streak, freezesUsed }
}

export function calculateSleepCycles(wakeTime, cycles) {
  const CYCLE_MINUTES = 90
  const [wh, wm] = wakeTime.split(':').map(Number)
  let wakeMins = wh * 60 + wm
  const totalSleepMins = Math.round(cycles * CYCLE_MINUTES)
  let bedMins = wakeMins - totalSleepMins
  if (bedMins < 0) bedMins += 1440
  const bedH = Math.floor(bedMins / 60) % 24
  const bedM = bedMins % 60
  const bedStr = String(bedH).padStart(2, '0') + ':' + String(bedM).padStart(2, '0')
  return {
    bedTime: bedStr,
    wakeTime: wakeTime,
    duration: totalSleepMins,
    cycles: cycles
  }
}

export function countCyclesBetween(bedTime, wakeTime) {
  const CYCLE_MINUTES = 90
  if (!bedTime || !wakeTime) return { cycles: 0, duration: 0 }
  const [bh, bm] = bedTime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let bedMins = bh * 60 + bm
  let wakeMins = wh * 60 + wm
  if (wakeMins <= bedMins) wakeMins += 1440
  const diff = wakeMins - bedMins
  return { cycles: Math.round(diff / CYCLE_MINUTES * 10) / 10, duration: diff }
}

export function calculateBedtimeFromCycles(bedTime, cycles) {
  const CYCLE_MINUTES = 90
  const [bh, bm] = bedTime.split(':').map(Number)
  let bedMins = bh * 60 + bm
  const totalSleepMins = Math.round(cycles * CYCLE_MINUTES)
  let wakeMins = bedMins + totalSleepMins
  if (wakeMins >= 1440) wakeMins -= 1440
  const wh = Math.floor(wakeMins / 60) % 24
  const wm = wakeMins % 60
  return {
    bedTime: bedTime,
    wakeTime: String(wh).padStart(2, '0') + ':' + String(wm).padStart(2, '0'),
    duration: totalSleepMins,
    cycles: cycles
  }
}

export function moodIcon(value) {
  const icons = { 1: IconMood1, 2: IconMood2, 3: IconMood3, 4: IconMood4, 5: IconMood5, 6: IconMood6, 7: IconMood7, 8: IconMood8, 9: IconMood9, 10: IconMood10 }
  return icons[value] || IconMood5
}
