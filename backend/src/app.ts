import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import { env } from './config/env';
import { authMiddleware } from './middleware/auth.middleware';
import { cacheMiddleware } from './middleware/cache.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { globalRateLimit } from './middleware/rateLimit.middleware';

import userRouter from './modules/user/user.router';
import habitsRouter from './modules/habits/habits.router';
import moodRouter from './modules/mood/mood.router';
import sleepRouter from './modules/sleep/sleep.router';
import hydrationRouter from './modules/hydration/hydration.router';
import breathingRouter from './modules/breathing/breathing.router';
import journalRouter from './modules/journal/journal.router';
import goalsRouter from './modules/goals/goals.router';
import analyticsRouter from './modules/analytics/analytics.router';
import calendarRouter from './modules/calendar/calendar.router';
import exportsRouter from './modules/exports/exports.router';
import notificationsRouter from './modules/notifications/notifications.router';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(globalRateLimit);
app.use(express.json({ limit: '10kb' }));
app.use(hpp());

app.use('/api/v1/habits', authMiddleware, cacheMiddleware, habitsRouter);
app.use('/api/v1/mood', authMiddleware, cacheMiddleware, moodRouter);
app.use('/api/v1/sleep', authMiddleware, cacheMiddleware, sleepRouter);
app.use('/api/v1/hydration', authMiddleware, cacheMiddleware, hydrationRouter);
app.use('/api/v1/breathing', authMiddleware, cacheMiddleware, breathingRouter);
app.use('/api/v1/journal', authMiddleware, cacheMiddleware, journalRouter);
app.use('/api/v1/goals', authMiddleware, cacheMiddleware, goalsRouter);
app.use('/api/v1/analytics', authMiddleware, cacheMiddleware, analyticsRouter);
app.use('/api/v1/calendar', authMiddleware, cacheMiddleware, calendarRouter);
app.use('/api/v1/user', authMiddleware, cacheMiddleware, userRouter);
app.use('/api/v1/exports', authMiddleware, exportsRouter);
app.use('/api/v1/notifications', authMiddleware, notificationsRouter);

app.get('/health', (_req, res) => { res.json({ success: true, data: { status: 'ok' } }); });

app.use(errorMiddleware);

export default app;
