import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const [nextSlot, nextMeetup, friendshipStats] = await Promise.all([
      db.query(
        `SELECT start_time, end_time FROM availability
         WHERE user_id = $1 AND start_time > NOW()
         ORDER BY start_time ASC LIMIT 1`,
        [userId]
      ),
      db.query(
        `SELECT m.title, m.start_time FROM meetups m
         JOIN meetup_participants mp ON mp.meetup_id = m.id
         WHERE mp.user_id = $1 AND m.start_time > NOW() AND m.status = 'scheduled'
         ORDER BY m.start_time ASC LIMIT 1`,
        [userId]
      ),
      db.query(
        `SELECT
           COUNT(*) FILTER (WHERE last_met >= NOW() - INTERVAL '30 days') AS met_recently,
           COUNT(*) AS total
         FROM friendships WHERE user_id = $1 AND status = 'accepted'`,
        [userId]
      )
    ]);

    const stats = friendshipStats.rows[0];
    const total = parseInt(stats.total, 10);
    const metRecently = parseInt(stats.met_recently, 10);
    const friendshipScore = total > 0 ? Math.round((metRecently / total) * 100) : 0;

    res.json({
      nextFreeSlot: nextSlot.rows[0] || null,
      upcomingMeetup: nextMeetup.rows[0] || null,
      friendshipScore
    });
  } catch (err) {
    console.error('Dashboard fetch error:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

export default router;
