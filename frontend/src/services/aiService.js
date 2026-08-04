import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Calls the backend, which runs Llama 3.2 via Ollama locally, and returns personalized meetup suggestions.
 * @param {{ user?: object, friends: object[], freeSlots?: object[], preferences?: object }} payload
 * @returns {Promise<Array<object>>}
 */
export const fetchMeetupSuggestions = async ({ user, friends, freeSlots, preferences }) => {
  const { data } = await axios.post(`${API_BASE}/api/ai/meetup-suggestions`, {
    user,
    friends,
    freeSlots,
    preferences
  });
  return data.suggestions;
};
