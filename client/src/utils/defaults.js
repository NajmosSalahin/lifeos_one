export const DEFAULT_HABITS = [
  { name: 'Drink Water (Morning)' },
  { name: 'Read 10 pages' },
  { name: 'Exercise 30m' }
]

export const DEFAULT_DRINKS = [
  { name: 'Glass of Water', volume: 250, multiplier: 1.0, icon: 'ph-drop' },
  { name: 'Water Bottle', volume: 500, multiplier: 1.0, icon: 'ph-drop-half' },
  { name: 'Coffee', volume: 250, multiplier: 0.8, icon: 'ph-coffee' },
  { name: 'Tea', volume: 250, multiplier: 0.9, icon: 'ph-tea-bag' },
  { name: 'Soda / Juice', volume: 330, multiplier: 0.6, icon: 'ph-bottle' }
]

export const DEFAULT_TECHNIQUES = [
  { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { name: 'Relaxing', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  { name: 'Equal Breathing', inhale: 4, hold1: 0, exhale: 4, hold2: 0 },
  { name: 'Awake', inhale: 6, hold1: 0, exhale: 2, hold2: 0 }
]

export const DEFAULT_PROFILE = {
  gender: 'male',
  weight: 65,
  height: 170,
  activityLevel: 1.2,
  temp: 22,
  humidity: 50,
  theme: 'Parchment'
}

export const ACTIVITY_OPTIONS = [
  { label: 'Sedentary', value: 1.0 },
  { label: 'Lightly Active', value: 1.2 },
  { label: 'Moderately Active', value: 1.4 },
  { label: 'Very Active', value: 1.6 }
]

export const MOOD_LABELS = {
  1: 'Awful', 2: 'Very Bad', 3: 'Bad', 4: 'Poor', 5: 'Neutral',
  6: 'Okay', 7: 'Good', 8: 'Very Good', 9: 'Great', 10: 'Amazing'
}

export const ENERGY_LABELS = {
  1: 'Drained', 2: 'Very Low', 3: 'Low', 4: 'Fair',   5: 'Moderate',
  6: 'Decent', 7: 'Good', 8: 'High', 9: 'Very High', 10: 'Max'
}

export const DRINK_ICONS = ['ph-drop', 'ph-drop-half', 'ph-coffee', 'ph-tea-bag', 'ph-bottle', 'ph-wine', 'ph-beer', 'ph-flask']
