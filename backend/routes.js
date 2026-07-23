import express from 'express';
import pool from './db.js';

const router = express.Router();

router.post('/request', async (req, res) => {
    const { userId, friendId } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, $3) RETURNING *',
            [userId, friendId, 'pending']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/respond', async (req, res) => {
    const { friendshipId, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE friendships SET status = $1 WHERE id = $2 RETURNING *',
            [status, friendshipId]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email 
       FROM users u
       JOIN friendships f ON (f.friend_id = u.id OR f.user_id = u.id)
       WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted' AND u.id != $1`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
