import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// to check if running or not
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FlowSphere API is running' });
});


//moth 
app.post('/api/auth/login', (req, res) => {
  res.json({ 
    user: { id: '1', name: 'Anjneya', email: 'anjneya@example.com' }, 
    token: 'mock-jwt-token' 
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('No MONGO_URI provided. Skipping database connection.');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
