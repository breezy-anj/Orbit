import express from 'express';
import db from '../db.js';
import { randomUUID } from 'crypto';
import { createMeetupInCalendars } from '../services/calendarEvents.js';

const router = express.Router();

router.post('/request', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { friendId, title, startTime, endTime, note } = req.body;
  if (!friendId || !title || !startTime || !endTime) {
    return res.status(400).json({ error: 'friendId, title, startTime, and endTime are required' });
  }

  const friendship = await db.query(
    `SELECT id FROM friendships WHERE user_id = $1 AND friend_id = $2 AND status = 'accepted'`,
    [userId, friendId]
  );
  if (friendship.rows.length === 0) {
    return res.status(403).json({ error: 'You can only send requests to friends' });
  }

  try {
    const meetupId = randomUUID();
    await db.query(
      `INSERT INTO meetups (id, title, start_time, end_time, status, host_id, note, requested_at)
       VALUES ($1, $2, $3, $4, 'pending_request', $5, $6, NOW())`,
      [meetupId, title, startTime, endTime, userId, note || null]
    );

    await db.query(
      `INSERT INTO meetup_participants (meetup_id, user_id, status)
       VALUES ($1, $2, 'accepted'), ($1, $3, 'pending')`,
      [meetupId, userId, friendId]
    );

    res.json({ success: true, meetupId });
  } catch (err) {
    console.error('Request meetup error:', err.message);
    res.status(500).json({ error: 'Failed to send meetup request' });
  }
});

router.get('/pending', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await db.query(
      `SELECT m.id, m.title, m.start_time, m.end_time, m.note, m.requested_at,
              u.id AS host_id, u.name AS host_name, u.email AS host_email
       FROM meetups m
       JOIN meetup_participants mp ON mp.meetup_id = m.id AND mp.user_id = $1 AND mp.status = 'pending'
       JOIN users u ON u.id = m.host_id
       WHERE m.status = 'pending_request' AND m.host_id != $1
       ORDER BY m.requested_at DESC`,
      [userId]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error('Get pending meetups error:', err.message);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

router.get('/sent', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await db.query(
      `SELECT m.id, m.title, m.start_time, m.end_time, m.note, m.status, m.requested_at,
              u.id AS guest_id, u.name AS guest_name, u.email AS guest_email
       FROM meetups m
       JOIN meetup_participants mp ON mp.meetup_id = m.id AND mp.user_id != $1
       JOIN users u ON u.id = mp.user_id
       WHERE m.host_id = $1 AND m.status IN ('pending_request', 'scheduled', 'declined')
       ORDER BY m.requested_at DESC
       LIMIT 20`,
      [userId]
    );
    res.json({ sent: result.rows });
  } catch (err) {
    console.error('Get sent meetups error:', err.message);
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
});

router.post('/:id/respond', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { response } = req.body; 
  if (!['accepted', 'declined'].includes(response)) {
    return res.status(400).json({ error: "response must be 'accepted' or 'declined'" });
  }

  const meetupId = req.params.id;

  try {
    
    const check = await db.query(
      `SELECT m.id, m.host_id, m.title FROM meetups m
       JOIN meetup_participants mp ON mp.meetup_id = m.id
       WHERE m.id = $1 AND mp.user_id = $2 AND mp.status = 'pending' AND m.status = 'pending_request'`,
      [meetupId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or already responded' });
    }

    const meetup = check.rows[0];

    if (response === 'declined') {
      await db.query(`UPDATE meetups SET status = 'declined' WHERE id = $1`, [meetupId]);
      await db.query(
        `UPDATE meetup_participants SET status = 'declined' WHERE meetup_id = $1 AND user_id = $2`,
        [meetupId, userId]
      );
      return res.json({ success: true, status: 'declined' });
    }

    await db.query(`UPDATE meetups SET status = 'scheduled' WHERE id = $1`, [meetupId]);
    await db.query(
      `UPDATE meetup_participants SET status = 'accepted' WHERE meetup_id = $1 AND user_id = $2`,
      [meetupId, userId]
    );

    let calendarResult = null;
    try {
      calendarResult = await createMeetupInCalendars(meetupId, meetup.host_id, userId);
    } catch (calErr) {
      console.error('Calendar event creation failed (non-fatal):', calErr.message);
    }

    res.json({
      success: true,
      status: 'scheduled',
      calendarEventsCreated: calendarResult !== null,
    });
  } catch (err) {
    console.error('Respond to meetup error:', err.message);
    res.status(500).json({ error: 'Failed to respond to request' });
  }
});

export default router;
