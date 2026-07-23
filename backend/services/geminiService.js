import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// gemini-2.5-flash is the current stable, cost-efficient model.
// Swap via GEMINI_MODEL env var (e.g. gemini-3.5-flash) without touching this file.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Structured output schema — Gemini will be forced to return JSON matching this shape,
// so the backend never has to fight with parsing loose text.
const SUGGESTION_SCHEMA = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          friendName: { type: 'string' },
          activity: { type: 'string' },
          venueType: { type: 'string' },
          suggestedTime: { type: 'string' },
          duration: { type: 'string' },
          reason: { type: 'string' }
        },
        required: ['friendName', 'activity', 'suggestedTime', 'reason']
      }
    }
  },
  required: ['suggestions']
};

function buildPrompt({ user, friends, freeSlots, preferences }) {
  const maxSuggestions = friends?.length ? Math.min(friends.length, 5) : 3;

  return `
You are Orbit's AI meetup planner. Orbit helps people keep friendships alive by turning free
calendar time into concrete, personalized meetup ideas.

Using the data below, suggest realistic meetups that fit the user's free time and each friend's
interests and relationship context.

USER:
${JSON.stringify(user || {}, null, 2)}

FRIENDS:
${JSON.stringify(friends || [], null, 2)}

FREE_SLOTS (only suggest meetups that fit inside one of these):
${JSON.stringify(freeSlots || [], null, 2)}

PREFERENCES:
${JSON.stringify(preferences || {}, null, 2)}

Rules:
- Every suggestion must fit inside one of the given FREE_SLOTS — reference the slot's day/time in "suggestedTime".
- Prioritize friends who haven't been met recently (see "lastMet" if provided).
- Keep "activity" concrete and specific (e.g. "Coffee and catch-up at a nearby cafe", not "Hang out").
- "reason" should be one short, warm sentence that references the specific friend's context (shared interest, how long since you last met, etc).
- Return at most ${maxSuggestions} suggestions, ranked with the best one first.
`;
}

/**
 * Calls the Gemini API and returns an array of personalized meetup suggestions.
 * @param {{user?: object, friends: object[], freeSlots?: object[], preferences?: object}} payload
 * @returns {Promise<Array<object>>}
 */
export async function getMeetupSuggestions(payload) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const prompt = buildPrompt(payload);

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: SUGGESTION_SCHEMA,
      temperature: 0.7
    }
  };

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textPart = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textPart) {
    throw new Error('Gemini API returned an empty response.');
  }

  let parsed;
  try {
    parsed = JSON.parse(textPart);
  } catch (err) {
    throw new Error('Failed to parse Gemini response as JSON.');
  }

  return parsed.suggestions || [];
}
