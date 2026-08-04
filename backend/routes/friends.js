import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, f.last_met, f.interests
       FROM friendships f
       JOIN users u ON u.id = f.friend_id
       WHERE f.user_id = $1 AND f.status = 'accepted'
       ORDER BY f.last_met ASC NULLS LAST`,
      [userId]
    );
    res.json({ friends: result.rows });
  } catch (err) {
    console.error('Friends fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

router.post('/', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { friendEmail } = req.body;
  if (!friendEmail) return res.status(400).json({ error: 'friendEmail is required' });

  try {
    const friendResult = await db.query('SELECT id FROM users WHERE email = $1', [friendEmail]);
    if (friendResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const friendId = friendResult.rows[0].id;
    if (friendId === userId) return res.status(400).json({ error: 'Cannot add yourself' });

    await db.query(
      `INSERT INTO friendships (user_id, friend_id, status, created_at)
       VALUES ($1, $2, 'accepted', NOW()), ($2, $1, 'accepted', NOW())
       ON CONFLICT DO NOTHING`,
      [userId, friendId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Add friend error:', err.message);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

router.delete('/:friendId', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    await db.query(
      'DELETE FROM friendships WHERE (user_id=$1 AND friend_id=$2) OR (user_id=$2 AND friend_id=$1)',
      [userId, req.params.friendId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Remove friend error:', err.message);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

export default router;
