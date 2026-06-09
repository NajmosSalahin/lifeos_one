import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Settings, User, Palette, Monitor, Bell, Shield,
  Droplets, Ruler, Weight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { useThemeStore, type Theme } from '../../shared/stores/themeStore';
import { useAuthStore } from '../../shared/stores/authStore';
import apiClient from '../../shared/api/client';
import { queryKeys } from '../../shared/api/queryKeys';

const THEME_PREVIEWS: Theme[] = ['light', 'dark', 'dracula', 'nord', 'catppuccin', 'tokyo-night', 'gruvbox', 'everforest', 'solarized-dark', 'one-dark', 'rose-pine'];

const profileSchema = z.object({
  name: z.string().min(1),
});

type ProfileForm = z.infer<typeof profileSchema>;

const healthSchema = z.object({
  heightCm: z.coerce.number().positive().optional().nullable(),
  weightKg: z.coerce.number().positive().optional().nullable(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']).optional(),
});

type HealthForm = z.infer<typeof healthSchema>;

function SettingsTab({ label, icon: Icon, active, onClick }: { label: string; icon: typeof Settings; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-accent-subtle text-accent' : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('appearance');

  const { data: prefs } = useQuery({
    queryKey: queryKeys.user.preferences(),
    queryFn: () => apiClient.get('/user/preferences').then(r => r.data.data),
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  });

  const healthForm = useForm<HealthForm>({
    resolver: zodResolver(healthSchema),
    defaultValues: {
      heightCm: prefs?.heightCm || undefined,
      weightKg: prefs?.weightKg || undefined,
      activityLevel: prefs?.activityLevel || 'MODERATE',
    },
  });

  const updatePrefs = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.patch('/user/preferences', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.all }),
  });

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'health', label: 'Health Profile', icon: Ruler },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

      <div className="flex gap-6">
        <div className="hidden w-48 space-y-1 sm:block">
          {tabs.map((tab) => (
            <SettingsTab key={tab.id} label={tab.label} icon={tab.icon} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === 'appearance' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Palette size={16} className="text-accent" /> Theme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                    {THEME_PREVIEWS.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTheme(t);
                          updatePrefs.mutate({ theme: t });
                        }}
                        className={`relative rounded-lg border-2 p-2 text-center text-xs font-medium transition-all ${
                          theme === t ? 'border-accent ring-1 ring-accent' : 'border-border hover:border-text-disabled'
                        }`}
                      >
                        <div className={`theme-${t} mx-auto mb-1 h-8 w-full rounded bg-background`}>
                          <div className="flex h-full items-center justify-center gap-0.5 px-1">
                            <div className="h-3 w-3 rounded-full bg-accent" />
                            <div className="h-2 flex-1 rounded bg-surface" />
                          </div>
                        </div>
                        <span className="capitalize text-text-primary">{t}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Monitor size={16} className="text-accent" /> Display</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Density Mode</label>
                    <select
                      value={prefs?.densityMode || 'COMFORTABLE'}
                      onChange={(e) => updatePrefs.mutate({ densityMode: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-ring"
                    >
                      <option value="COMPACT">Compact</option>
                      <option value="COMFORTABLE">Comfortable</option>
                      <option value="SPACIOUS">Spacious</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Font Size: {prefs?.fontSize || 15}px</label>
                    <input
                      type="range"
                      min="12"
                      max="20"
                      value={prefs?.fontSize || 15}
                      onChange={(e) => updatePrefs.mutate({ fontSize: parseInt(e.target.value) })}
                      className="mt-1 w-full accent-accent"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User size={16} className="text-accent" /> Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input id="name" label="Name" {...profileForm.register('name')} />
                <Input id="email" label="Email" value={user?.email || ''} disabled />
                <Button onClick={() => profileForm.handleSubmit((data) => updatePrefs.mutate(data))()}>Save</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'health' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Ruler size={16} className="text-accent" /> Health Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-text-secondary">Your health data is used to calculate personalized hydration goals.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input id="height" label="Height (cm)" type="number" {...healthForm.register('heightCm')} />
                  <Input id="weight" label="Weight (kg)" type="number" {...healthForm.register('weightKg')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Activity Level</label>
                  <select
                    {...healthForm.register('activityLevel')}
                    className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-ring"
                  >
                    <option value="SEDENTARY">Sedentary</option>
                    <option value="LIGHT">Light</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="ACTIVE">Active</option>
                    <option value="VERY_ACTIVE">Very Active</option>
                  </select>
                </div>
                <Button onClick={() => healthForm.handleSubmit((data) => updatePrefs.mutate(data))()}>Save Health Profile</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell size={16} className="text-accent" /> Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Notification settings coming soon.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
