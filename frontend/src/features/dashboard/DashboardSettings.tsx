import { useState } from 'react';
import { Modal } from '../../shared/components/ui/modal';

interface DashboardSettingsProps {
  open: boolean;
  onClose: () => void;
}

export function DashboardSettings({ open, onClose }: DashboardSettingsProps) {
  return (
    <Modal open={open} onClose={onClose} title="Dashboard Settings">
      <p className="text-sm text-text-secondary">Dashboard layout customization coming soon.</p>
    </Modal>
  );
}
