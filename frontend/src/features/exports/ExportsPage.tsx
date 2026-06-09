import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Download, Settings, FileJson, FileText, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Modal } from '../../shared/components/ui/modal';
import apiClient from '../../shared/api/client';

export function ExportsPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const jsonExport = useMutation({
    mutationFn: () => apiClient.get('/exports/json', { responseType: 'blob' }),
    onSuccess: (res) => downloadFile(res.data as Blob, 'lifeos-export.json'),
  });

  const mdExport = useMutation({
    mutationFn: () => apiClient.get('/exports/markdown/journal', { responseType: 'blob' }),
    onSuccess: (res) => downloadFile(res.data as Blob, 'lifeos-journal.md'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Exports</h1>
        <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
          <Settings size={16} />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileJson size={16} className="text-accent" /> JSON Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-text-secondary">Export all your data as a single JSON file</p>
            <Button size="sm" onClick={() => jsonExport.mutate()} disabled={jsonExport.isPending}>
              <Download size={14} /> {jsonExport.isPending ? 'Exporting...' : 'Export JSON'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText size={16} className="text-accent" /> Journal (Markdown)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-text-secondary">Export journal entries as Markdown</p>
            <Button size="sm" onClick={() => mdExport.mutate()} disabled={mdExport.isPending}>
              <Download size={14} /> {mdExport.isPending ? 'Exporting...' : 'Export Markdown'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileSpreadsheet size={16} className="text-accent" /> CSV Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-text-secondary">Export per-module data as CSV spreadsheets</p>
            <div className="flex flex-wrap gap-2">
              {['habits', 'mood', 'sleep', 'hydration'].map((mod) => (
                <CSVExportButton key={mod} module={mod} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ExportsSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function CSVExportButton({ module }: { module: string }) {
  const exportCsv = useMutation({
    mutationFn: () => apiClient.get(`/exports/csv/${module}`, { responseType: 'blob' }),
    onSuccess: (res) => {
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifeos-${module}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  return (
    <Button size="sm" variant="outline" onClick={() => exportCsv.mutate()} disabled={exportCsv.isPending}>
      <Download size={12} /> {module}
    </Button>
  );
}

function ExportsSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Export Settings">
      <p className="text-sm text-text-secondary">Configure export date ranges, file formats, and auto-backup preferences.</p>
    </Modal>
  );
}
