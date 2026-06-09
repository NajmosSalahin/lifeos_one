import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  activeModal: string | null;
  modalData: unknown;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  openModal: (name: string, data?: unknown) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarWidth: 260,
  activeModal: null,
  modalData: null,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  openModal: (name, data) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));
