import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Ollama runs Llama 3.2 locally — completely free, no API key required.
// Setup (one-time):
//   1. Install Ollama: https://ollama.com/download
//   2. Run in a terminal:  ollama pull llama3.2
//   3. Ollama serves itself automatically at http://localhost:11434
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Same schema as before — passed as Ollama's "format" param to keep the
// response structured, so nothing downstream (routes/ai.js, the frontend) needs to change.
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
- Respond with ONLY the JSON object described by the schema — no extra commentary.
`;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const analyticsDir = path.join(__dirname, '..', 'analytics');

function getAIPredictions(payload) {
  return new Promise((resolve, reject) => {
    execFile(
      'python3',
      ['predict_cli.py', JSON.stringify(payload)],
      { cwd: analyticsDir },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve(JSON.parse(stdout));
      }
    );
  });
}

export async function getMeetupSuggestions(payload) {
  const userIds = payload.friends.map(f => f.name.toLowerCase());
  if (payload.user?.name) {
    userIds.push(payload.user.name.toLowerCase());
  }

  try {
    const mlResponse = await getAIPredictions({
      action: 'best_slots',
      user_ids: userIds,
      top_n: 5
    });

    payload.freeSlots = mlResponse.suggestions.map(s => ({
      datetime: s.datetime,
      joint_free_probability: (s.joint_free_probability * 100).toFixed(0) + '%'
    }));
  } catch (err) {
    console.error('ML Prediction failed, falling back to provided freeSlots:', err);
  }

  const prompt = buildPrompt(payload);

  const requestBody = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
    format: SUGGESTION_SCHEMA,
    options: { temperature: 0.7 }
  };

  let response;
  try {
    response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
  } catch (err) {
    // Most common failure: Ollama isn't installed or isn't running.
    throw new Error(
      'Could not reach Ollama at ' +
        OLLAMA_URL +
        '. Make sure Ollama is installed and running, and that you have run "ollama pull ' +
        OLLAMA_MODEL +
        '".'
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textPart = data?.response;

  if (!textPart) {
    throw new Error('Ollama returned an empty response.');
  }

  let parsed;
  try {
    parsed = JSON.parse(textPart);
  } catch (err) {
    throw new Error('Failed to parse Ollama response as JSON.');
  }

  return parsed.suggestions || [];
}
