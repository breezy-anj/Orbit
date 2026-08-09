import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const fetchMeetupSuggestions = async ({ user, friends, freeSlots, preferences }) => {
  const { data } = await axios.post(`${API_BASE}/api/ai/meetup-suggestions`, {
    user,
    friends,
    freeSlots,
    preferences
  });
  return data.suggestions;
};
