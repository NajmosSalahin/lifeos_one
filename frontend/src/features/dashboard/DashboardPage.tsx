import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  CheckCircle, Smile, Moon, Droplets, BookOpen, Target,
  Plus, Sparkles, TrendingUp, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { CardSkeleton } from '../../shared/components/feedback/Skeleton';
import { ErrorState } from '../../shared/components/feedback/ErrorState';
import { ProgressRing } from '../../shared/components/common/ProgressRing';
import { Badge } from '../../shared/components/common/Badge';
import apiClient from '../../shared/api/client';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: habits, isLoading: habitsLoading, error: habitsError, refetch: refetchHabits } = useQuery({
    queryKey: ['dashboard', 'habits'],
    queryFn: () => apiClient.get('/habits').then(r => r.data.data),
  });

  const { data: mood, isLoading: moodLoading } = useQuery({
    queryKey: ['dashboard', 'mood'],
    queryFn: () => apiClient.get('/mood').then(r => r.data.data),
  });

  const { data: sleep, isLoading: sleepLoading } = useQuery({
    queryKey: ['dashboard', 'sleep'],
    queryFn: () => apiClient.get('/sleep').then(r => r.data.data),
  });

  const { data: hydration, isLoading: hydrationLoading } = useQuery({
    queryKey: ['dashboard', 'hydration'],
    queryFn: () => apiClient.get('/hydration').then(r => r.data.data),
  });

  const { data: journal } = useQuery({
    queryKey: ['dashboard', 'journal'],
    queryFn: () => apiClient.get('/journal').then(r => r.data.data),
  });

  const { data: goals } = useQuery({
    queryKey: ['dashboard', 'goals'],
    queryFn: () => apiClient.get('/goals').then(r => r.data.data),
  });

  const today = format(new Date(), 'EEEE, MMMM d');
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const lastMood = Array.isArray(mood) && mood.length > 0 ? mood[0] : null;
  const lastSleep = Array.isArray(sleep) && sleep.length > 0 ? sleep[0] : null;
  const todayHydration = Array.isArray(hydration) ? hydration.filter((l: { loggedAt: string }) =>
    format(new Date(l.loggedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ) : [];
  const totalHydrationMl = todayHydration.reduce((a: number, l: { amount: number }) => a + l.amount, 0);
  const recentEntries = Array.isArray(journal) ? journal.slice(0, 3) : [];
  const activeGoals = Array.isArray(goals) ? goals.filter((g: { status: string }) => g.status === 'ACTIVE').slice(0, 4) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{greeting}, {user?.name || 'Friend'}</h1>
          <p className="text-sm text-text-secondary">{today}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle size={16} className="text-accent" /> Habits</CardTitle>
          </CardHeader>
          <CardContent>
            {habitsLoading ? <CardSkeleton /> : habitsError ? <ErrorState onRetry={refetchHabits} /> : (
              <div className="text-2xl font-bold text-text-primary">{Array.isArray(habits) ? habits.length : 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smile size={16} className="text-accent" /> Mood</CardTitle>
          </CardHeader>
          <CardContent>
            {moodLoading ? <CardSkeleton /> : lastMood ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-text-primary">{lastMood.score}/10</span>
                {lastMood.note && <span className="text-xs text-text-secondary truncate">{lastMood.note}</span>}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No mood logged today</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Moon size={16} className="text-accent" /> Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            {sleepLoading ? <CardSkeleton /> : lastSleep ? (
              <div>
                <span className="text-2xl font-bold text-text-primary">
                  {lastSleep.durationMinutes ? Math.round(lastSleep.durationMinutes / 60 * 10) / 10 : '?'}h
                </span>
                {lastSleep.quality && <Badge variant="accent" className="ml-2">{lastSleep.quality}/5</Badge>}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No sleep logged</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Droplets size={16} className="text-accent" /> Hydration</CardTitle>
          </CardHeader>
          <CardContent>
            {hydrationLoading ? <CardSkeleton /> : (
              <div className="flex items-center gap-3">
                <ProgressRing progress={Math.min((totalHydrationMl / 2500) * 100, 100)} size={40} />
                <span className="text-lg font-bold text-text-primary">{Math.round(totalHydrationMl)}ml</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target size={16} className="text-accent" /> Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {activeGoals.length === 0 ? (
              <p className="text-sm text-text-secondary">No active goals. Create one!</p>
            ) : (
              <div className="space-y-3">
                {activeGoals.slice(0, 3).map((goal: { id: string; title: string; progress: number }) => (
                  <div key={goal.id} className="flex items-center gap-3">
                    <ProgressRing progress={goal.progress} size={32} strokeWidth={3} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{goal.title}</p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-border">
                        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${goal.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen size={16} className="text-accent" /> Recent Journal</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <p className="text-sm text-text-secondary">No journal entries yet</p>
            ) : (
              <div className="space-y-2">
                {recentEntries.map((entry: { id: string; title: string; createdAt: string; wordCount: number }) => (
                  <div key={entry.id} className="rounded-md border border-border bg-background p-3">
                    <p className="text-sm font-medium text-text-primary">{entry.title}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {format(new Date(entry.createdAt), 'MMM d')} · {entry.wordCount} words
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles size={16} className="text-accent" /> Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => navigate('/mood')}><Smile size={14} /> Log Mood</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/hydration')}><Droplets size={14} /> Add Water</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/breathing')}><Clock size={14} /> Breathe</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/journal')}><BookOpen size={14} /> New Entry</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
