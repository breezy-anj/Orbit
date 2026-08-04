
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import legacyFriendsRouter from './routes.js';
import availabilityRouter from './availibility.js';
import scheduleRouter from './schedule.js';
import aiRouter from './routes/ai.js';
import friendsRouter from './routes/friends.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FlowSphere API is running on PostgreSQL' });
});

app.use('/api/ai', aiRouter);

app.get('/api/users', async (req, res) => {
  const result = await pool.query('SELECT id, name, email FROM users ORDER BY name ASC');
  res.json({ users: result.rows });
});

app.post('/api/auth/login', async (req, res) => {
  const { userId } = req.body;
  const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
  const user = result.rows[0];
  res.json({ user, token: 'mock-jwt-' + user.id });
});

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();
  const userId = token.replace('mock-jwt-', '');
  const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
  if (result.rows.length > 0) req.user = result.rows[0];
  next();
};

app.use(authMiddleware);
app.use('/api/friends', friendsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/legacy/friends', legacyFriendsRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/schedule', scheduleRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
