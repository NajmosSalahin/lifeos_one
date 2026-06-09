import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Settings } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Modal } from '../../shared/components/ui/modal';
import { ErrorState } from '../../shared/components/feedback/ErrorState';
import { CardSkeleton } from '../../shared/components/feedback/Skeleton';
import apiClient from '../../shared/api/client';
import { queryKeys } from '../../shared/api/queryKeys';

const CHART_COLORS = ['var(--color-accent)', 'var(--color-accent-hover)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-error)'];

export function AnalyticsPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: overview, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.analytics.overview(),
    queryFn: () => apiClient.get('/analytics/overview').then(r => r.data.data),
    staleTime: 30_000,
  });

  if (error) return <ErrorState onRetry={refetch} />;

  const habitData = [
    { name: 'Mon', value: 5 },
    { name: 'Tue', value: 8 },
    { name: 'Wed', value: 6 },
    { name: 'Thu', value: 9 },
    { name: 'Fri', value: 7 },
    { name: 'Sat', value: 4 },
    { name: 'Sun', value: 6 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
          <Settings size={16} />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader><CardTitle>Avg. Mood</CardTitle></CardHeader>
              <CardContent><span className="text-2xl font-bold text-text-primary">{overview?.mood?.averageScore || 'N/A'}</span></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Avg. Sleep</CardTitle></CardHeader>
              <CardContent><span className="text-2xl font-bold text-text-primary">{overview?.sleep?.averageDurationMinutes ? `${Math.round(overview.sleep.averageDurationMinutes / 60 * 10) / 10}h` : 'N/A'}</span></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Hydration</CardTitle></CardHeader>
              <CardContent><span className="text-2xl font-bold text-text-primary">{overview?.hydration?.totalMl ? `${Math.round(overview.hydration.totalMl)}ml` : 'N/A'}</span></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Mindful Minutes</CardTitle></CardHeader>
              <CardContent><span className="text-2xl font-bold text-text-primary">{overview?.breathing?.totalMindfulMinutes || 0}</span></CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Weekly Habit Completions</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={habitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Mood Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={habitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} />
                    <YAxis domain={[0, 10]} stroke="var(--color-text-secondary)" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} dot={{ fill: 'var(--color-accent)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader><CardTitle>Composition</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Habits', value: overview?.habits?.totalCompletions || 0 },
                      { name: 'Mood', value: overview?.mood?.totalEntries || 0 },
                      { name: 'Sleep', value: overview?.sleep?.totalEntries || 0 },
                      { name: 'Journal', value: overview?.journal?.totalEntries || 0 },
                    ]} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                      {[0, 1, 2, 3].map((i) => (
                        <Cell key={i} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Journal</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-text-primary">{overview?.journal?.totalEntries || 0}</p>
                <p className="text-sm text-text-secondary">total entries</p>
                <p className="mt-2 text-sm text-text-secondary">{overview?.journal?.totalWords || 0} words written</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Goals</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">{overview?.goals?.completed || 0}</p>
                <p className="text-sm text-text-secondary">completed</p>
                <p className="mt-2 text-sm text-text-secondary">{overview?.goals?.inProgress || 0} in progress</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <AnalyticsSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function AnalyticsSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Analytics Settings">
      <p className="text-sm text-text-secondary">Configure date ranges, chart preferences, and correlation analysis settings.</p>
    </Modal>
  );
}
