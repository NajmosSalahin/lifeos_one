export const queryKeys = {
  user: {
    all: ['user'] as const,
    profile: () => ['user', 'profile'] as const,
    preferences: () => ['user', 'preferences'] as const,
  },
  habits: {
    all: ['habits'] as const,
    list: () => ['habits', 'list'] as const,
    detail: (id: string) => ['habits', id] as const,
    logs: (habitId: string) => ['habits', 'logs', habitId] as const,
  },
  mood: {
    all: ['mood'] as const,
    list: () => ['mood', 'list'] as const,
  },
  sleep: {
    all: ['sleep'] as const,
    list: () => ['sleep', 'list'] as const,
  },
  hydration: {
    all: ['hydration'] as const,
    logs: () => ['hydration', 'logs'] as const,
    templates: () => ['hydration', 'templates'] as const,
    weatherGoal: () => ['hydration', 'weather-goal'] as const,
  },
  breathing: {
    all: ['breathing'] as const,
    techniques: () => ['breathing', 'techniques'] as const,
    sessions: () => ['breathing', 'sessions'] as const,
    mindfulMinutes: () => ['breathing', 'mindful-minutes'] as const,
  },
  journal: {
    all: ['journal'] as const,
    list: () => ['journal', 'list'] as const,
    search: (q: string) => ['journal', 'search', q] as const,
  },
  goals: {
    all: ['goals'] as const,
    list: () => ['goals', 'list'] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    overview: () => ['analytics', 'overview'] as const,
    module: (mod: string) => ['analytics', mod] as const,
  },
  calendar: {
    month: (year: number, month: number) => ['calendar', year, month] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
  },
};
