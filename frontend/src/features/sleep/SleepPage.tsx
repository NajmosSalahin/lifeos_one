import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Moon, Settings, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Modal } from '../../shared/components/ui/modal';
import { EmptyState } from '../../shared/components/feedback/EmptyState';
import { ErrorState } from '../../shared/components/feedback/ErrorState';
import { ListSkeleton } from '../../shared/components/feedback/Skeleton';
import { Badge } from '../../shared/components/common/Badge';
import apiClient from '../../shared/api/client';
import { queryKeys } from '../../shared/api/queryKeys';

export function SleepPage() {
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.sleep.list(),
    queryFn: () => apiClient.get('/sleep').then(r => r.data.data),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: () => apiClient.post('/sleep', {
      sleepStart: new Date(Date.now() - 8 * 3600000).toISOString(),
      sleepEnd: new Date().toISOString(),
      quality: Math.floor(Math.random() * 3) + 3,
      loggedAt: new Date().toISOString(),
    }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sleep.all });
      const previousLogs = queryClient.getQueryData(queryKeys.sleep.list());
      queryClient.setQueryData(queryKeys.sleep.list(), (old: unknown) => {
        const optimisticLog = { id: `temp-${Date.now()}`, sleepStart: new Date(Date.now() - 8 * 3600000).toISOString(), sleepEnd: new Date().toISOString(), durationMinutes: 0, quality: Math.floor(Math.random() * 3) + 3, loggedAt: new Date().toISOString() };
        const logs = Array.isArray(old) ? old : [];
        return [optimisticLog, ...logs];
      });
      return { previousLogs };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLogs) queryClient.setQueryData(queryKeys.sleep.list(), context.previousLogs);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.sleep.all }),
  });

  if (isLoading) return <ListSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;

  const sleepLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Sleep Tracker</h1>
        <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
          <Settings size={16} />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Tonight&apos;s Sleep</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Moon size={16} /> Log Sleep
          </Button>
        </CardContent>
      </Card>

      {sleepLogs.length === 0 ? (
        <EmptyState icon={<Moon size={40} />} title="No sleep logs yet" description="Log your sleep to start tracking patterns" />
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">History</h2>
          {sleepLogs.slice(0, 20).map((log: { id: string; sleepStart: string; sleepEnd: string; durationMinutes: number; quality: number; loggedAt: string }) => (
            <Card key={log.id} className="flex items-center gap-4">
              <Moon size={20} className="text-accent" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">
                    {log.durationMinutes ? `${Math.round(log.durationMinutes / 60 * 10) / 10}h` : 'N/A'}
                  </span>
                  {log.quality && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: log.quality }).map((_, i) => (
                        <Star key={i} size={12} className="fill-warning text-warning" />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-secondary">
                  {format(new Date(log.sleepStart), 'HH:mm')} – {format(new Date(log.sleepEnd), 'HH:mm')}
                </p>
              </div>
              <span className="text-xs text-text-disabled">{format(new Date(log.loggedAt), 'MMM d')}</span>
            </Card>
          ))}
        </div>
      )}

      <SleepSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function SleepSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Sleep Settings">
      <p className="text-sm text-text-secondary">Configure sleep goals, bedtime reminders, and quality rating preferences.</p>
    </Modal>
  );
}
