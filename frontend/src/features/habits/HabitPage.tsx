import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Plus, Settings, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Modal } from '../../shared/components/ui/modal';
import { Badge } from '../../shared/components/common/Badge';
import { EmptyState } from '../../shared/components/feedback/EmptyState';
import { ErrorState } from '../../shared/components/feedback/ErrorState';
import { ListSkeleton } from '../../shared/components/feedback/Skeleton';
import apiClient from '../../shared/api/client';
import { queryKeys } from '../../shared/api/queryKeys';
import { format } from 'date-fns';

export function HabitPage() {
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: habits, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.habits.list(),
    queryFn: () => apiClient.get('/habits').then(r => r.data.data),
  });

  const logMutation = useMutation({
    mutationFn: (habitId: string) => apiClient.post(`/habits/${habitId}/logs`, {
      completedAt: new Date().toISOString(),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.habits.all }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/habits/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.habits.all }),
  });

  if (isLoading) return <ListSkeleton count={5} />;
  if (error) return <ErrorState onRetry={refetch} />;

  const habitList = Array.isArray(habits) ? habits : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Habits</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} />
          </Button>
          <Button size="sm"><Plus size={16} /> New Habit</Button>
        </div>
      </div>

      {habitList.length === 0 ? (
        <EmptyState icon={<CheckCircle size={40} />} title="No habits yet" description="Create your first habit to start tracking" action={<Button><Plus size={16} /> Create Habit</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {habitList.map((habit: { id: string; name: string; description?: string; color: string; frequency: string; category?: string }) => (
            <motion.div key={habit.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: habit.color }} />
                    <CardTitle>{habit.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => logMutation.mutate(habit.id)}>
                      <CheckCircle size={16} className="text-success" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => deleteMutation.mutate(habit.id)}>
                      <Trash2 size={14} className="text-text-disabled" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {habit.description && <p className="text-sm text-text-secondary mb-2">{habit.description}</p>}
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">{habit.frequency}</Badge>
                    {habit.category && <Badge>{habit.category}</Badge>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <HabitSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function HabitSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Habit Settings">
      <p className="text-sm text-text-secondary">Configure default habit categories, reminder times, and tracking preferences.</p>
    </Modal>
  );
}
