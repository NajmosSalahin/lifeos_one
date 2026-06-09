import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wind, Settings, Timer, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Modal } from '../../shared/components/ui/modal';
import { Badge } from '../../shared/components/common/Badge';
import { ErrorState } from '../../shared/components/feedback/ErrorState';
import { ListSkeleton } from '../../shared/components/feedback/Skeleton';
import apiClient from '../../shared/api/client';
import { queryKeys } from '../../shared/api/queryKeys';

export function BreathingPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTechnique, setActiveTechnique] = useState<{
    name: string; inhaleDuration: number; holdInDuration: number; exhaleDuration: number; holdOutDuration: number; cycles: number
  } | null>(null);

  const { data: techniques, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.breathing.techniques(),
    queryFn: () => apiClient.get('/breathing/techniques').then(r => r.data.data),
  });

  const { data: mindful } = useQuery({
    queryKey: queryKeys.breathing.mindfulMinutes(),
    queryFn: () => apiClient.get('/breathing/mindful-minutes').then(r => r.data.data),
  });

  if (isLoading) return <ListSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;

  const techniqueList = Array.isArray(techniques) ? techniques : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">Breathing</h1>
          {mindful && (
            <Badge variant="accent" className="flex items-center gap-1">
              <Clock size={12} /> {mindful.totalMindfulMinutes} min total
            </Badge>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
          <Settings size={16} />
        </Button>
      </div>

      {activeTechnique ? (
        <BreathingSessionPlayer
          technique={activeTechnique}
          onEnd={() => setActiveTechnique(null)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {techniqueList.map((t: {
            id: string; name: string; description?: string;
            inhaleDuration: number; holdInDuration: number; exhaleDuration: number; holdOutDuration: number; cycles: number; isBuiltIn: boolean
          }) => (
            <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTechnique(t)}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Wind size={18} className="text-accent" />
                  <CardTitle>{t.name}</CardTitle>
                  {t.isBuiltIn && <Badge variant="accent">Built-in</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                {t.description && <p className="text-sm text-text-secondary mb-2">{t.description}</p>}
                <p className="text-xs text-text-disabled">
                  {t.inhaleDuration}s–{t.holdInDuration}s–{t.exhaleDuration}s–{t.holdOutDuration}s · {t.cycles} cycles
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BreathingSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function BreathingSessionPlayer({ technique, onEnd }: {
  technique: { name: string; inhaleDuration: number; holdInDuration: number; exhaleDuration: number; holdOutDuration: number; cycles: number };
  onEnd: () => void;
}) {
  const [phase, setPhase] = useState<'inhale' | 'hold-in' | 'exhale' | 'hold-out'>('inhale');
  const [cycle, setCycle] = useState(1);
  const [timeLeft, setTimeLeft] = useState(technique.inhaleDuration);

  useEffect(() => {
    if (cycle > technique.cycles) {
      onEnd();
      return;
    }

    const duration = phase === 'inhale' ? technique.inhaleDuration
      : phase === 'hold-in' ? technique.holdInDuration
      : phase === 'exhale' ? technique.exhaleDuration
      : technique.holdOutDuration;

    if (duration === 0) {
      const nextPhase = phase === 'inhale' ? (technique.holdInDuration > 0 ? 'hold-in' : 'exhale')
        : phase === 'hold-in' ? 'exhale'
        : phase === 'exhale' ? (technique.holdOutDuration > 0 ? 'hold-out' : 'inhale')
        : 'inhale';
      setPhase(nextPhase);
      if (nextPhase === 'inhale') setCycle(c => c + 1);
      return;
    }

    setTimeLeft(duration);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const nextPhase = phase === 'inhale' ? (technique.holdInDuration > 0 ? 'hold-in' : 'exhale')
            : phase === 'hold-in' ? 'exhale'
            : phase === 'exhale' ? (technique.holdOutDuration > 0 ? 'hold-out' : 'inhale')
            : 'inhale';
          setPhase(nextPhase);
          if (nextPhase === 'inhale') setCycle(c => c + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, cycle]);

  const scale = phase === 'inhale' ? 1.3 : phase === 'exhale' ? 0.7 : 1;
  const label = phase === 'inhale' ? 'Breathe In' : phase === 'hold-in' ? 'Hold' : phase === 'exhale' ? 'Breathe Out' : 'Hold';

  return (
    <Card className="text-center py-8">
      <CardContent>
        <p className="text-sm text-text-secondary mb-2">{technique.name}</p>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Timer size={14} className="text-accent" />
          <span className="text-xs text-text-secondary">Cycle {cycle}/{technique.cycles}</span>
        </div>
        <motion.div
          animate={{ scale }}
          transition={{ duration: 0.3 }}
          className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-2 border-accent mb-4"
        >
          <div className="text-center">
            <p className="text-lg font-bold text-accent">{label}</p>
            <p className="text-3xl font-bold text-text-primary">{timeLeft}</p>
          </div>
        </motion.div>
        <Button variant="secondary" onClick={onEnd}>End Session</Button>
      </CardContent>
    </Card>
  );
}

function BreathingSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Breathing Settings">
      <p className="text-sm text-text-secondary">Configure custom breathing techniques, session reminders, and sound preferences.</p>
    </Modal>
  );
}
