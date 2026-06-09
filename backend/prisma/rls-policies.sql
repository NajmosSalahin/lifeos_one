-- Supabase Row-Level Security Policies for LifeOS
-- Run these in the Supabase SQL Editor after migrations are applied

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserPreferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Habit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HabitLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MoodLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SleepLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HydrationLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DrinkTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BreathingTechnique" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BreathingSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GoalMilestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Users table
CREATE POLICY "Users can read own record" ON "User"
  FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own record" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

-- UserPreferences
CREATE POLICY "Users can read own preferences" ON "UserPreferences"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own preferences" ON "UserPreferences"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own preferences" ON "UserPreferences"
  FOR UPDATE USING (auth.uid()::text = "userId");

-- Habits
CREATE POLICY "Users can read own habits" ON "Habit"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own habits" ON "Habit"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own habits" ON "Habit"
  FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own habits" ON "Habit"
  FOR DELETE USING (auth.uid()::text = "userId");

-- HabitLogs
CREATE POLICY "Users can read own habit logs" ON "HabitLog"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own habit logs" ON "HabitLog"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own habit logs" ON "HabitLog"
  FOR DELETE USING (auth.uid()::text = "userId");

-- MoodLogs
CREATE POLICY "Users can read own mood logs" ON "MoodLog"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own mood logs" ON "MoodLog"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own mood logs" ON "MoodLog"
  FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own mood logs" ON "MoodLog"
  FOR DELETE USING (auth.uid()::text = "userId");

-- SleepLogs
CREATE POLICY "Users can read own sleep logs" ON "SleepLog"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own sleep logs" ON "SleepLog"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own sleep logs" ON "SleepLog"
  FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own sleep logs" ON "SleepLog"
  FOR DELETE USING (auth.uid()::text = "userId");

-- HydrationLogs
CREATE POLICY "Users can read own hydration logs" ON "HydrationLog"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own hydration logs" ON "HydrationLog"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own hydration logs" ON "HydrationLog"
  FOR DELETE USING (auth.uid()::text = "userId");

-- DrinkTemplates
CREATE POLICY "Users can read own drink templates" ON "DrinkTemplate"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own drink templates" ON "DrinkTemplate"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own drink templates" ON "DrinkTemplate"
  FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own drink templates" ON "DrinkTemplate"
  FOR DELETE USING (auth.uid()::text = "userId");

-- JournalEntries
CREATE POLICY "Users can read own journal entries" ON "JournalEntry"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own journal entries" ON "JournalEntry"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own journal entries" ON "JournalEntry"
  FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own journal entries" ON "JournalEntry"
  FOR DELETE USING (auth.uid()::text = "userId");

-- BreathingTechniques
CREATE POLICY "Users can read own or built-in techniques" ON "BreathingTechnique"
  FOR SELECT USING (auth.uid()::text = "userId" OR "isBuiltIn" = true);
CREATE POLICY "Users can insert own techniques" ON "BreathingTechnique"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own techniques" ON "BreathingTechnique"
  FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own techniques" ON "BreathingTechnique"
  FOR DELETE USING (auth.uid()::text = "userId");

-- BreathingSessions
CREATE POLICY "Users can read own breathing sessions" ON "BreathingSession"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own breathing sessions" ON "BreathingSession"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- Goals
CREATE POLICY "Users can read own goals" ON "Goal"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can insert own goals" ON "Goal"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own goals" ON "Goal"
  FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own goals" ON "Goal"
  FOR DELETE USING (auth.uid()::text = "userId");

-- GoalMilestones
CREATE POLICY "Users can read own goal milestones" ON "GoalMilestone"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "Goal" WHERE "Goal".id = "goalId" AND "Goal"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can insert own goal milestones" ON "GoalMilestone"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "Goal" WHERE "Goal".id = "goalId" AND "Goal"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can update own goal milestones" ON "GoalMilestone"
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "Goal" WHERE "Goal".id = "goalId" AND "Goal"."userId" = auth.uid()::text)
  );
CREATE POLICY "Users can delete own goal milestones" ON "GoalMilestone"
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM "Goal" WHERE "Goal".id = "goalId" AND "Goal"."userId" = auth.uid()::text)
  );

-- Notifications
CREATE POLICY "Users can read own notifications" ON "Notification"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can update own notifications" ON "Notification"
  FOR UPDATE USING (auth.uid()::text = "userId");
