import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const analyticsDir = path.join(__dirname, '..', 'analytics');

function getAIPredictions(payload) {
  return new Promise((resolve, reject) => {
    execFile(
      "python3",
      ["predict_cli.py", JSON.stringify(payload)],
      { cwd: analyticsDir },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve(JSON.parse(stdout));
      }
    );
  });
}

export async function getMeetupSuggestions(payload) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const userIds = payload.friends.map(f => f.name.toLowerCase());
  if (payload.user?.name) {
    userIds.push(payload.user.name.toLowerCase());
  }
  
  try {
    const mlResponse = await getAIPredictions({
      action: "best_slots",
      user_ids: userIds,
      top_n: 5
    });
    
    payload.freeSlots = mlResponse.suggestions.map(s => ({
      datetime: s.datetime,
      joint_free_probability: (s.joint_free_probability * 100).toFixed(0) + '%'
    }));
  } catch (err) {
    console.error("ML Prediction failed, falling back to provided freeSlots:", err);
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
