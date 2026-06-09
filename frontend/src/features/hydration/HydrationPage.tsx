import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Droplets, Settings, Plus, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Modal } from '../../shared/components/ui/modal';
import { EmptyState } from '../../shared/components/feedback/EmptyState';
import { ErrorState } from '../../shared/components/feedback/ErrorState';
import { ListSkeleton } from '../../shared/components/feedback/Skeleton';
import { ProgressRing } from '../../shared/components/common/ProgressRing';
import apiClient from '../../shared/api/client';
import { queryKeys } from '../../shared/api/queryKeys';
import { format } from 'date-fns';
import { HumanBody } from './HumanBody';

export function HydrationPage() {
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.hydration.logs(),
    queryFn: () => apiClient.get('/hydration').then(r => r.data.data),
  });

  const { data: templates } = useQuery({
    queryKey: queryKeys.hydration.templates(),
    queryFn: () => apiClient.get('/hydration/templates').then(r => r.data.data),
  });

  const { data: weatherGoal } = useQuery({
    queryKey: queryKeys.hydration.weatherGoal(),
    queryFn: () => apiClient.get('/hydration/weather-goal?lat=40.7128&lng=-74.0060').then(r => r.data.data),
    retry: false,
  });

  const logMutation = useMutation({
    mutationFn: (amount: number) => apiClient.post('/hydration', { amount, loggedAt: new Date().toISOString() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.hydration.all }),
  });

  if (isLoading) return <ListSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;

  const hydrationLogs = Array.isArray(logs) ? logs : [];
  const todayLogs = hydrationLogs.filter((l: { loggedAt: string }) =>
    format(new Date(l.loggedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  const totalMl = todayLogs.reduce((a: number, l: { amount: number }) => a + l.amount, 0);
  const dailyGoal = weatherGoal?.goal || 2500;
  const progress = Math.min((totalMl / dailyGoal) * 100, 100);

  const templateList = Array.isArray(templates) ? templates : [];
  const quickAmounts = templateList.length > 0
    ? templateList.map((t: { amount: number }) => t.amount)
    : [200, 250, 350, 500];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Hydration</h1>
        <div className="flex items-center gap-2">
          {weatherGoal?.weather && (
            <div className="flex items-center gap-1 text-sm text-text-secondary">
              <Thermometer size={14} />
              {Math.round(weatherGoal.weather.temperature)}°C
            </div>
          )}
          <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <HumanBody fillLevel={progress / 100} />
              <div className="mt-4">
                <span className="text-3xl font-bold text-text-primary">{Math.round(totalMl)}ml</span>
                <span className="text-sm text-text-secondary"> / {dailyGoal}ml</span>
              </div>
              <ProgressRing progress={progress} size={64} strokeWidth={5} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[...new Set(quickAmounts)].slice(0, 6).map((amount: number) => (
                <Button
                  key={amount}
                  size="sm"
                  variant="outline"
                  onClick={() => logMutation.mutate(amount)}
                  disabled={logMutation.isPending}
                >
                  <Droplets size={14} /> {amount}ml
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {hydrationLogs.length === 0 ? (
        <EmptyState icon={<Droplets size={40} />} title="No hydration logs yet" description="Tap a quick amount above to log your intake" />
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Today</h2>
          {todayLogs.slice(0, 10).map((log: { id: string; amount: number; note?: string; loggedAt: string }) => (
            <Card key={log.id} className="flex items-center gap-3">
              <Droplets size={16} className="text-accent" />
              <span className="text-sm font-medium text-text-primary">{log.amount}ml</span>
              {log.note && <span className="text-xs text-text-secondary">{log.note}</span>}
              <span className="ml-auto text-xs text-text-disabled">{format(new Date(log.loggedAt), 'HH:mm')}</span>
            </Card>
          ))}
        </div>
      )}

      <HydrationSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function HydrationSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Hydration Settings">
      <p className="text-sm text-text-secondary">Configure daily goals, drink templates, weather-based adjustments, and measurement units.</p>
    </Modal>
  );
}
