import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Settings, Plus, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Modal } from '../../shared/components/ui/modal';
import { EmptyState } from '../../shared/components/feedback/EmptyState';
import { ErrorState } from '../../shared/components/feedback/ErrorState';
import { ListSkeleton } from '../../shared/components/feedback/Skeleton';
import { Badge } from '../../shared/components/common/Badge';
import { ProgressRing } from '../../shared/components/common/ProgressRing';
import apiClient from '../../shared/api/client';
import { queryKeys } from '../../shared/api/queryKeys';

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'accent'> = {
  ACTIVE: 'accent',
  COMPLETED: 'success',
  ARCHIVED: 'default',
  ON_HOLD: 'warning',
};

export function GoalsPage() {
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: goals, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.goals.list(),
    queryFn: () => apiClient.get('/goals').then(r => r.data.data),
    staleTime: 30_000,
  });

  const toggleMilestone = useMutation({
    mutationFn: ({ goalId, milestoneId, completed }: { goalId: string; milestoneId: string; completed: boolean }) =>
      apiClient.patch(`/goals/${goalId}/milestones/${milestoneId}`, { completed }),
    onMutate: async ({ goalId, milestoneId, completed }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.all });
      const previousGoals = queryClient.getQueryData(queryKeys.goals.list());
      queryClient.setQueryData(queryKeys.goals.list(), (old: unknown) => {
        const goals = Array.isArray(old) ? old : [];
        return goals.map((goal: { id: string; progress: number; milestones: { id: string; completed: boolean }[] }) => {
          if (goal.id !== goalId) return goal;
          const milestones = goal.milestones.map((ms) =>
            ms.id === milestoneId ? { ...ms, completed } : ms
          );
          const completedCount = milestones.filter((ms) => ms.completed).length;
          const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;
          return { ...goal, milestones, progress };
        });
      });
      return { previousGoals };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousGoals) queryClient.setQueryData(queryKeys.goals.list(), context.previousGoals);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.goals.all }),
  });

  if (isLoading) return <ListSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;

  const goalList = Array.isArray(goals) ? goals : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Goals</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} />
          </Button>
          <Button size="sm"><Plus size={16} /> New Goal</Button>
        </div>
      </div>

      {goalList.length === 0 ? (
        <EmptyState icon={<Target size={40} />} title="No goals yet" description="Create your first goal and set milestones" action={<Button><Plus size={16} /> Create Goal</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goalList.map((goal: { id: string; title: string; description?: string; status: string; progress: number; deadline: string; milestones: { id: string; title: string; completed: boolean }[] }) => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ProgressRing progress={goal.progress} size={32} strokeWidth={3} />
                  <CardTitle>{goal.title}</CardTitle>
                </div>
                <Badge variant={statusColors[goal.status] || 'default'}>{goal.status}</Badge>
              </CardHeader>
              <CardContent>
                {goal.description && <p className="text-sm text-text-secondary mb-3">{goal.description}</p>}
                {goal.deadline && (
                  <p className="text-xs text-text-disabled mb-3">Due: {format(new Date(goal.deadline), 'MMM d, yyyy')}</p>
                )}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="space-y-1.5">
                    {goal.milestones.map((ms) => (
                      <button
                        key={ms.id}
                        onClick={() => toggleMilestone.mutate({ goalId: goal.id, milestoneId: ms.id, completed: !ms.completed })}
                        className="flex items-center gap-2 w-full text-left"
                      >
                        {ms.completed
                          ? <CheckCircle2 size={14} className="text-success shrink-0" />
                          : <Circle size={14} className="text-text-disabled shrink-0" />
                        }
                        <span className={`text-sm ${ms.completed ? 'text-text-disabled line-through' : 'text-text-primary'}`}>
                          {ms.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GoalsSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function GoalsSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Goal Settings">
      <p className="text-sm text-text-secondary">Configure goal categories, deadline reminders, and default progress tracking.</p>
    </Modal>
  );
}
