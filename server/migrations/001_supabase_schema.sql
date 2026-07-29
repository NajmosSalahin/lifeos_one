-- Run this in Supabase SQL Editor

-- Profiles (replaces users/{uid} document)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text DEFAULT 'User',
  email text,
  gender text DEFAULT 'male',
  weight numeric DEFAULT 65,
  height numeric DEFAULT 170,
  activity_level numeric DEFAULT 1.2,
  temp numeric DEFAULT 22,
  humidity numeric DEFAULT 50,
  theme text DEFAULT 'Parchment',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Habits
CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  archived boolean DEFAULT false,
  done_dates jsonb DEFAULT '[]',
  skipped_dates jsonb DEFAULT '[]',
  weekly_goal int DEFAULT 0,
  freeze_limit int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- Moods
CREATE TABLE moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  value int CHECK (value >= 1 AND value <= 10),
  energy int CHECK (energy >= 1 AND energy <= 10),
  note text,
  time text,
  timestamp bigint,
  date text
);
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own moods" ON moods FOR ALL USING (auth.uid() = user_id);

-- Sleep logs
CREATE TABLE sleep (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type text CHECK (type IN ('night', 'nap')),
  bed_time text,
  wake_time text,
  awake_minutes int DEFAULT 0,
  hours numeric DEFAULT 0,
  minutes int DEFAULT 0,
  quality text,
  good_notes text,
  bad_notes text,
  date text,
  timestamp bigint,
  time text
);
ALTER TABLE sleep ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own sleep" ON sleep FOR ALL USING (auth.uid() = user_id);

-- Hydration logs
CREATE TABLE hydration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  drink_id text,
  drink_name text,
  volume numeric,
  multiplier numeric DEFAULT 1.0,
  icon text,
  time text,
  timestamp bigint,
  date text
);
ALTER TABLE hydration ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own hydration" ON hydration FOR ALL USING (auth.uid() = user_id);

-- Journals
CREATE TABLE journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text,
  body text,
  date text,
  timestamp bigint
);
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own journals" ON journals FOR ALL USING (auth.uid() = user_id);

-- Breathing sessions
CREATE TABLE breathing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  technique_id text,
  technique_name text,
  duration_seconds int,
  timestamp bigint,
  time text,
  date text
);
ALTER TABLE breathing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own breathing" ON breathing FOR ALL USING (auth.uid() = user_id);

-- Custom drinks
CREATE TABLE custom_drinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text,
  volume numeric,
  multiplier numeric DEFAULT 1.0,
  icon text
);
ALTER TABLE custom_drinks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own custom_drinks" ON custom_drinks FOR ALL USING (auth.uid() = user_id);

-- Breathing techniques
CREATE TABLE breathing_techniques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text,
  inhale int DEFAULT 4,
  hold1 int DEFAULT 0,
  exhale int DEFAULT 4,
  hold2 int DEFAULT 0
);
ALTER TABLE breathing_techniques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own breathing_techniques" ON breathing_techniques FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime for all tables (needed for live subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE habits;
ALTER PUBLICATION supabase_realtime ADD TABLE moods;
ALTER PUBLICATION supabase_realtime ADD TABLE sleep;
ALTER PUBLICATION supabase_realtime ADD TABLE hydration;
ALTER PUBLICATION supabase_realtime ADD TABLE journals;
ALTER PUBLICATION supabase_realtime ADD TABLE breathing;
ALTER PUBLICATION supabase_realtime ADD TABLE custom_drinks;
ALTER PUBLICATION supabase_realtime ADD TABLE breathing_techniques;
