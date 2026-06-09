import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../shared/components/layout/AppShell';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { LandingPage } from '../features/auth/pages/LandingPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { HabitPage } from '../features/habits/HabitPage';
import { MoodPage } from '../features/mood/MoodPage';
import { SleepPage } from '../features/sleep/SleepPage';
import { HydrationPage } from '../features/hydration/HydrationPage';
import { BreathingPage } from '../features/breathing/BreathingPage';
import { JournalPage } from '../features/journal/JournalPage';
import { GoalsPage } from '../features/goals/GoalsPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { CalendarPage } from '../features/calendar/CalendarPage';
import { ExportsPage } from '../features/exports/ExportsPage';
import { SettingsPage } from '../features/settings/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/habits" element={<HabitPage />} />
        <Route path="/mood" element={<MoodPage />} />
        <Route path="/sleep" element={<SleepPage />} />
        <Route path="/hydration" element={<HydrationPage />} />
        <Route path="/breathing" element={<BreathingPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/exports" element={<ExportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
