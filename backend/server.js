import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './database.js';
import friendRoutes from './route.js';
import availabilityRoutes from './availibility.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FlowSphere API is running on PostgreSQL' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ 
    user: { id: '1', name: 'Anjneya', email: 'anjneya@example.com' }, 
    token: 'mock-jwt-token' 
  });
});

app.use('/api/friends', friendRoutes);
app.use('/api/availability', availabilityRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
