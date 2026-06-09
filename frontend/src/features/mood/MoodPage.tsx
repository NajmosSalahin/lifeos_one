import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Smile, Settings, Meh, Frown, Angry, Heart, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Modal } from '../../shared/components/ui/modal';
import { EmptyState } from '../../shared/components/feedback/EmptyState';
import { ErrorState } from '../../shared/components/feedback/ErrorState';
import { ListSkeleton } from '../../shared/components/feedback/Skeleton';
import { Badge } from '../../shared/components/common/Badge';
import apiClient from '../../shared/api/client';
import { queryKeys } from '../../shared/api/queryKeys';
import { format } from 'date-fns';

const moodEmojis: Record<number, { icon: typeof Smile; label: string; color: string }> = {
  1: { icon: Angry, label: 'Terrible', color: '#ef4444' },
  2: { icon: Frown, label: 'Bad', color: '#f97316' },
  3: { icon: Frown, label: 'Poor', color: '#f59e0b' },
  4: { icon: Meh, label: 'Meh', color: '#eab308' },
  5: { icon: Meh, label: 'Okay', color: '#84cc16' },
  6: { icon: Smile, label: 'Good', color: '#22c55e' },
  7: { icon: Smile, label: 'Great', color: '#10b981' },
  8: { icon: Heart, label: 'Happy', color: '#14b8a6' },
  9: { icon: Heart, label: 'Amazing', color: '#06b6d4' },
  10: { icon: Heart, label: 'Perfect', color: '#8b5cf6' },
};

export function MoodPage() {
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.mood.list(),
    queryFn: () => apiClient.get('/mood').then(r => r.data.data),
    staleTime: 30_000,
  });

  const logMutation = useMutation({
    mutationFn: (score: number) => apiClient.post('/mood', { score, loggedAt: new Date().toISOString() }),
    onMutate: async (score) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.mood.all });
      const previousLogs = queryClient.getQueryData(queryKeys.mood.list());
      queryClient.setQueryData(queryKeys.mood.list(), (old: unknown) => {
        const optimisticLog = { id: `temp-${Date.now()}`, score, loggedAt: new Date().toISOString() };
        const logs = Array.isArray(old) ? old : [];
        return [optimisticLog, ...logs];
      });
      return { previousLogs };
    },
    onError: (_err, _score, context) => {
      if (context?.previousLogs) queryClient.setQueryData(queryKeys.mood.list(), context.previousLogs);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.mood.all }),
  });

  if (isLoading) return <ListSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;

  const moodLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Mood Tracker</h1>
        <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
          <Settings size={16} />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How are you feeling?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-3 pl-0.5 pt-0.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
              const emoji = moodEmojis[score];
              const Icon = emoji.icon;
              return (
                <button
                  key={score}
                  onClick={() => {
                    setSelectedScore(score);
                    logMutation.mutate(score);
                  }}
                  className={`flex flex-col items-center gap-3 rounded-lg p-3 transition-all hover:bg-surface-raised ${
                    selectedScore === score ? 'bg-surface-raised' : ''
                  } outline-none`}
                >
                  <Icon size={24} style={{ color: emoji.color }} />
                  <span className="text-[10px] text-text-secondary">{emoji.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {moodLogs.length === 0 ? (
        <EmptyState icon={<Smile size={40} />} title="No mood logs yet" description="Tap a score above to log your mood" />
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">History</h2>
          {moodLogs.slice(0, 20).map((log: { id: string; score: number; note?: string; loggedAt: string }) => {
            const emoji = moodEmojis[log.score];
            const Icon = emoji.icon;
            return (
              <Card key={log.id} className="flex items-center gap-3">
                <Icon size={20} style={{ color: emoji.color }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{emoji.label}</span>
                    <span className="text-xs text-text-secondary">{log.score}/10</span>
                  </div>
                  {log.note && <p className="text-xs text-text-secondary">{log.note}</p>}
                </div>
                <span className="text-xs text-text-disabled">{format(new Date(log.loggedAt), 'MMM d, HH:mm')}</span>
              </Card>
            );
          })}
        </div>
      )}

      <MoodSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function MoodSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Mood Settings">
      <p className="text-sm text-text-secondary">Configure mood reminders, default note prompts, and notification preferences.</p>
    </Modal>
  );
}
