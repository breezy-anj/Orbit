import express from 'express';
import db from '../db.js';
import { syncCalendarForUser } from '../services/calendarSync.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const [nextSlot, nextMeetup, friendshipStats, calendarInfo, pendingReqs, upcomingEvents] = await Promise.all([
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
      ),
      db.query(
        'SELECT calendar_synced_at FROM users WHERE id = $1',
        [userId]
      ),
      
      db.query(
        `SELECT COUNT(*) AS count FROM meetups m
         JOIN meetup_participants mp ON mp.meetup_id = m.id AND mp.user_id = $1 AND mp.status = 'pending'
         WHERE m.status = 'pending_request' AND m.host_id != $1`,
        [userId]
      ),
      
      db.query(
        `SELECT m.id, m.title, m.start_time, m.end_time,
                json_agg(json_build_object('name', u.name, 'email', u.email)) AS attendees
         FROM meetups m
         JOIN meetup_participants mp ON mp.meetup_id = m.id
         JOIN users u ON u.id = mp.user_id
         WHERE mp.meetup_id IN (
           SELECT meetup_id FROM meetup_participants WHERE user_id = $1
         )
         AND m.start_time > NOW()
         AND m.status = 'scheduled'
         GROUP BY m.id
         ORDER BY m.start_time ASC
         LIMIT 5`,
        [userId]
      ),
    ]);

    const stats        = friendshipStats.rows[0];
    const totalFriends = parseInt(stats.total, 10);

    res.json({
      nextFreeSlot:         nextSlot.rows[0] || null,
      upcomingMeetup:       nextMeetup.rows[0] || null,
      upcomingEvents:       upcomingEvents.rows,
      totalFriends,
      calendarSyncedAt:     calendarInfo.rows[0]?.calendar_synced_at || null,
      pendingRequestsCount: parseInt(pendingReqs.rows[0]?.count || '0', 10),
    });
  } catch (err) {
    console.error('Dashboard fetch error:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

router.post('/sync-calendar', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await syncCalendarForUser(userId);
    res.json({
      success: true,
      message: `Synced ${result.freeSlotsCount} free slots and ${result.meetupsCount} upcoming events.`,
      ...result,
    });
  } catch (err) {
    console.error('Calendar sync error:', err.message);

    if (err.message.includes('not connected')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: 'Calendar sync failed. Please try again.' });
  }
});

export default router;
