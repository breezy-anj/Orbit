import express from 'express';
import cors from 'cors';
import pool from './db.js';
import authRouter from './routes/auth.js';
import aiRouter from './routes/ai.js';
import friendsRouter from './routes/friends.js';
import dashboardRouter from './routes/dashboard.js';
import meetupsRouter from './routes/meetups.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FlowSphere API is running' });
});

app.use('/api/auth', authRouter);

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token.startsWith('orbit-jwt-')) return next();

  const userId = token.replace('orbit-jwt-', '');
  try {
    const result = await pool.query(
      'SELECT id, name, email, calendar_synced_at FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length > 0) req.user = result.rows[0];
  } catch (err) {
    console.error('Auth middleware error:', err.message);
  }
  next();
};

app.use(authMiddleware);

app.use('/api/ai', aiRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/meetups', meetupsRouter);

app.get('/api/users', async (req, res) => {
  const result = await pool.query('SELECT id, name, email FROM users ORDER BY name ASC');
  res.json({ users: result.rows });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
