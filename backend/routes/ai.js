import express from 'express';
import { getMeetupSuggestions } from '../services/geminiService.js';

const router = express.Router();

// POST /api/ai/meetup-suggestions
// body: { user?: object, friends: object[], freeSlots?: object[], preferences?: object }
router.post('/meetup-suggestions', async (req, res) => {
  const { user, friends, freeSlots, preferences } = req.body;

  if (!Array.isArray(friends) || friends.length === 0) {
    return res.status(400).json({
      error: 'At least one friend (with a name) is required to generate suggestions.'
    });
  }

  try {
    const suggestions = await getMeetupSuggestions({ user, friends, freeSlots, preferences });
    return res.status(200).json({ suggestions });
  } catch (err) {
    console.error('AI meetup suggestion error:', err.message);
    return res.status(500).json({ error: 'Failed to generate meetup suggestions. Please try again.' });
  }
});

export default router;
