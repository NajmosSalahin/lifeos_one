import { lazy, Suspense, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import { LoadingSpinner } from './components/ui/Loaders'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const MoodTracker = lazy(() => import('./pages/MoodTracker'))
const HabitTracker = lazy(() => import('./pages/HabitTracker'))
const SleepTracker = lazy(() => import('./pages/SleepTracker'))
const HydrationTracker = lazy(() => import('./pages/HydrationTracker'))
const Breathing = lazy(() => import('./pages/Breathing'))
const Journal = lazy(() => import('./pages/Journal'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))

export default function App() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  if (loading) return <LoadingSpinner />

  const isAuthPage = ['/', '/login', '/register', '/forgot-password'].includes(location.pathname)
  const showNav = !isAuthPage && user

  return (
    <div className="h-screen overflow-hidden bg-app flex flex-col">
      {showNav && <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />}
      <div className="flex-1 flex min-h-0">
        {showNav && (
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        )}
        <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <Suspense fallback={<LoadingSpinner />}>
              <div key={location.pathname} className="page-enter">
                <Routes>
                  <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
                  <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
                  <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
                  <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/mood" element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} />
                  <Route path="/habits" element={<ProtectedRoute><HabitTracker /></ProtectedRoute>} />
                  <Route path="/sleep" element={<ProtectedRoute><SleepTracker /></ProtectedRoute>} />
                  <Route path="/hydration" element={<ProtectedRoute><HydrationTracker /></ProtectedRoute>} />
                  <Route path="/breathing" element={<ProtectedRoute><Breathing /></ProtectedRoute>} />
                  <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </Suspense>
          </div>
        </main>
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}
