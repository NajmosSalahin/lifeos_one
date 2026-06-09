import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, CheckCircle, Smile, Moon, Droplets, Wind,
  BookOpen, Target, BarChart3, Calendar, Download, Sparkles
} from 'lucide-react';

const features = [
  { icon: LayoutDashboard, label: 'Dashboard', desc: 'Everything at a glance' },
  { icon: CheckCircle, label: 'Habit Tracker', desc: 'Build better routines' },
  { icon: Smile, label: 'Mood Tracker', desc: 'Understand your emotions' },
  { icon: Moon, label: 'Sleep Tracker', desc: 'Optimize your rest' },
  { icon: Droplets, label: 'Hydration', desc: 'Smart water goals' },
  { icon: Wind, label: 'Breathing', desc: 'Guided sessions & mindfulness' },
  { icon: BookOpen, label: 'Journal', desc: 'Rich text reflections' },
  { icon: Target, label: 'Goals', desc: 'Track your milestones' },
  { icon: BarChart3, label: 'Analytics', desc: 'Data-driven insights' },
  { icon: Calendar, label: 'Calendar', desc: 'Your life in one view' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-bold text-accent">LifeOS</span>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 pt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-text-secondary">
              <Sparkles size={14} className="text-accent" />
              Your personal life operating system
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-6xl">
              Take control of
              <br />
              <span className="text-accent">every dimension</span> of your life
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-text-secondary">
              Track habits, mood, sleep, hydration, breathing, journaling, goals, and more — all in one beautiful, private dashboard.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="rounded-lg bg-accent px-6 py-3 text-base font-medium text-white hover:bg-accent-hover transition-colors shadow-lg"
              >
                Start Free
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-border px-6 py-3 text-base font-medium text-text-primary hover:bg-surface transition-colors"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-text-primary">
            Everything you need to thrive
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-lg border border-border bg-surface p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle">
                  <f.icon size={20} className="text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">{f.label}</h3>
                <p className="mt-1 text-xs text-text-secondary">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-text-secondary">
        <p>LifeOS — Built with React, Express, TypeScript & Supabase</p>
      </footer>
    </div>
  );
}
