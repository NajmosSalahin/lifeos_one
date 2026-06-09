interface HydrationInput {
  weightKg: number;
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
  temperature: number;
  humidity: number;
}

const activityMultipliers: Record<string, number> = {
  SEDENTARY: 1.0,
  LIGHT: 1.1,
  MODERATE: 1.2,
  ACTIVE: 1.3,
  VERY_ACTIVE: 1.5,
};

export function calculateHydrationGoal(input: HydrationInput): number {
  const base = input.weightKg * 30;
  const activityAdjust = base * (activityMultipliers[input.activityLevel] - 1);
  let tempAdjust = 0;
  if (input.temperature > 25) {
    tempAdjust = Math.ceil((input.temperature - 25) / 5) * 300;
  }
  let humidityAdjust = 0;
  if (input.humidity < 30) {
    humidityAdjust = 300;
  }
  return Math.round(base + activityAdjust + tempAdjust + humidityAdjust);
}
