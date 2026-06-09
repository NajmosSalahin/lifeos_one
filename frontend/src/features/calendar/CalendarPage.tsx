import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Modal } from '../../shared/components/ui/modal';
import { ErrorState } from '../../shared/components/feedback/ErrorState';
import { CardSkeleton } from '../../shared/components/feedback/Skeleton';
import apiClient from '../../shared/api/client';
import { queryKeys } from '../../shared/api/queryKeys';

export function CalendarPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: monthData, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.calendar.month(year, month),
    queryFn: () => apiClient.get(`/calendar/${year}/${month}`).then(r => r.data.data),
  });

  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const startDay = getDay(startOfMonth(currentDate));
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dayData = monthData?.days || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Calendar</h1>
        <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
          <Settings size={16} />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setCurrentDate(d => subMonths(d, 1))}>
              <ChevronLeft size={16} />
            </Button>
            <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setCurrentDate(d => addMonths(d, 1))}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CardSkeleton />
          ) : error ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayNames.map((name) => (
                  <div key={name} className="py-2 text-center text-xs font-medium text-text-secondary">{name}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {days.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const info = dayData[key];
                  return (
                    <div
                      key={key}
                      className={`flex flex-col items-center rounded-md p-2 text-sm transition-colors hover:bg-surface-raised ${
                        format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'ring-1 ring-accent' : ''
                      }`}
                    >
                      <span className="font-medium text-text-primary">{format(day, 'd')}</span>
                      {info && (
                        <div className="mt-1 flex gap-0.5">
                          {info.habits > 0 && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
                          {info.mood !== null && <div className="h-1.5 w-1.5 rounded-full bg-success" />}
                          {info.sleep && <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-hover)]" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CalendarSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function CalendarSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Calendar Settings">
      <p className="text-sm text-text-secondary">Configure default view, week start day, and activity dot preferences.</p>
    </Modal>
  );
}
