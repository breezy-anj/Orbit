import express from 'express';
import pool from './database.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { userId, startTime, endTime, timezone } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO availability (user_id, start_time, end_time, timezone) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, startTime, endTime, timezone || 'UTC']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM availability WHERE user_id = $1 ORDER BY start_time ASC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
