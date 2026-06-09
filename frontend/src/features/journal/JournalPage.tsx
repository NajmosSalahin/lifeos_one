import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Settings, Plus, Search, Heart, Trash2 } from 'lucide-react';
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

export function JournalPage() {
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: entries, isLoading, error, refetch } = useQuery({
    queryKey: searchQuery ? queryKeys.journal.search(searchQuery) : queryKeys.journal.list(),
    queryFn: () => {
      if (searchQuery) return apiClient.get(`/journal/search?q=${encodeURIComponent(searchQuery)}`).then(r => r.data.data);
      return apiClient.get('/journal').then(r => r.data.data);
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/journal/${id}/favorite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.journal.all }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/journal/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.journal.all }),
  });

  if (isLoading) return <ListSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;

  const journalEntries = Array.isArray(entries) ? entries : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Journal</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} />
          </Button>
          <Button size="sm"><Plus size={16} /> New Entry</Button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
        <input
          type="text"
          placeholder="Search journal entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-disabled focus-ring"
        />
      </div>

      {journalEntries.length === 0 ? (
        <EmptyState icon={<BookOpen size={40} />} title="No journal entries yet" description="Write your first entry to start reflecting" action={<Button><Plus size={16} /> New Entry</Button>} />
      ) : (
        <div className="space-y-2">
          {journalEntries.slice(0, 20).map((entry: { id: string; title: string; content: string; tags: string[]; favorited: boolean; wordCount: number; createdAt: string }) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {entry.title}
                  {entry.favorited && <Heart size={14} className="fill-error text-error" />}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <button onClick={() => favoriteMutation.mutate(entry.id)} className="p-1 rounded hover:bg-surface">
                    <Heart size={14} className={entry.favorited ? 'fill-error text-error' : 'text-text-disabled'} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(entry.id)} className="p-1 rounded hover:bg-surface">
                    <Trash2 size={14} className="text-text-disabled" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none text-text-secondary line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                />
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {entry.tags.map((tag: string) => (
                    <Badge key={tag} variant="accent">{tag}</Badge>
                  ))}
                  <span className="text-xs text-text-disabled ml-auto">
                    {format(new Date(entry.createdAt), 'MMM d, yyyy')} · {entry.wordCount} words
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <JournalSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function JournalSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Journal Settings">
      <p className="text-sm text-text-secondary">Configure editor preferences, default tags, and auto-save behavior.</p>
    </Modal>
  );
}
