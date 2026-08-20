import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

/* ──────────────────────────────────────────────
   Provider selection — set AI_PROVIDER env var:
     "ollama"  → local Ollama  (default for dev)
     "groq"    → Groq cloud    (default for prod)
   ────────────────────────────────────────────── */

const AI_PROVIDER = process.env.AI_PROVIDER || (process.env.GROQ_API_KEY ? 'groq' : 'ollama');

// Ollama config
const OLLAMA_URL   = process.env.OLLAMA_URL   || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Groq config
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

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
          reason: { type: 'string' },
          startIso: { type: 'string' },
          endIso: { type: 'string' }
        },
        required: ['friendName', 'activity', 'suggestedTime', 'reason', 'startIso', 'endIso']
      }
    }
  },
  required: ['suggestions']
};

function buildPrompt({ user, friends, freeSlots, preferences }) {
  const count = Math.min(Math.max(friends?.length * 2 || 3, 3), 5);

  const friendsBlock = (friends || []).map(f => {
    const parts = [`Name: ${f.name}`];
    if (f.interests?.length) parts.push(`Interests: ${Array.isArray(f.interests) ? f.interests.join(', ') : f.interests}`);
    if (f.lastMet) parts.push(`Last met: ${f.lastMet}`);
    return parts.join(' | ');
  }).join('\n');

  const slotsBlock = (freeSlots || []).length
    ? JSON.stringify(freeSlots, null, 2)
    : 'No specific slots provided — use general day/time guidance (morning, afternoon, evening).';

  return `You are Orbit's AI meetup planner. Your job is to suggest realistic, varied, and personalised meetup ideas.

USER: ${user?.name || 'Unknown'}

FRIENDS:
${friendsBlock || 'No friend data provided.'}

FREE_SLOTS:
${slotsBlock}

PREFERENCES: ${JSON.stringify(preferences || {})}

STRICT RULES — follow every single one:
1. Return EXACTLY ${count} suggestions. No more, no fewer.
2. For each suggestion, assign it to one of the friends listed above in "friendName".
3. Every suggestion must use a DIFFERENT activity type (e.g. coffee/brunch, walk or hike, board games, movie, dinner, sport).
4. "suggestedTime" MUST be a plain readable string like "Saturday evening" or "Sunday morning".
5. "startIso" and "endIso" MUST be exact ISO 8601 strings (e.g. "2026-08-22T18:00:00.000Z") representing a 2-hour window.
6. "reason" must be one warm, genuine sentence.
7. "activity" must be specific (e.g. "Try new coffee spot downtown" or "Cook dinner together at home").
8. Respond with ONLY valid JSON matching this schema:
{
  "suggestions": [
    {
      "friendName": "Exact Name of Friend",
      "activity": "Activity Name",
      "suggestedTime": "Saturday morning",
      "reason": "Why this meetup idea is great",
      "startIso": "2026-08-22T10:00:00.000Z",
      "endIso": "2026-08-22T12:00:00.000Z"
    }
  ]
}`;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const analyticsDir = path.join(__dirname, '..', 'analytics');

function getAIPredictions(payload) {
  return new Promise((resolve, reject) => {
    execFile(
      'python3',
      ['predict_cli.py', JSON.stringify(payload)],
      { cwd: analyticsDir, timeout: 3000 },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

/* ──────────────────────────────────────────────
   Ollama provider (local)
   ────────────────────────────────────────────── */
async function callOllama(prompt) {
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
    throw new Error(
      'Could not reach Ollama at ' + OLLAMA_URL +
      '. Make sure Ollama is installed and running, and that you have run "ollama pull ' +
      OLLAMA_MODEL + '".'
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textPart = data?.response;
  if (!textPart) throw new Error('Ollama returned an empty response.');

  return JSON.parse(textPart);
}

/* ──────────────────────────────────────────────
   Groq provider (cloud — free tier Llama / GPT-OSS)
   ────────────────────────────────────────────── */
async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY || GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not set. Get a free key at https://console.groq.com and add it to your .env file.'
    );
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful AI meetup planner that always responds with valid JSON matching the requested schema.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textPart = data?.choices?.[0]?.message?.content;
  if (!textPart) throw new Error('Groq returned an empty response.');

  return JSON.parse(textPart);
}

/* ──────────────────────────────────────────────
   Main export
   ────────────────────────────────────────────── */
export async function getMeetupSuggestions(payload) {
  const userIds = (payload.friends || []).map(f => (f.name || '').toLowerCase());
  if (payload.user?.name) {
    userIds.push(payload.user.name.toLowerCase());
  }

  try {
    const mlResponse = await getAIPredictions({
      action: 'best_slots',
      user_ids: userIds,
      top_n: 5
    });

    if (mlResponse?.suggestions) {
      payload.freeSlots = mlResponse.suggestions.map(s => ({
        datetime: s.datetime,
        joint_free_probability: (s.joint_free_probability * 100).toFixed(0) + '%'
      }));
    }
  } catch (err) {
    console.error('ML Prediction fallback to provided freeSlots:', err.message);
  }

  const prompt = buildPrompt(payload);
  const provider = process.env.AI_PROVIDER || (process.env.GROQ_API_KEY ? 'groq' : 'ollama');

  console.log(`[AI] Using provider: ${provider}`);

  const parsed = provider === 'groq'
    ? await callGroq(prompt)
    : await callOllama(prompt);

  const rawList = parsed.suggestions || (Array.isArray(parsed) ? parsed : []);
  const friendsList = payload.friends || [];

  return rawList.map((s, idx) => {
    const defaultFriend = friendsList[idx % (friendsList.length || 1)]?.name || 'Friend';
    return {
      friendName: s.friendName || defaultFriend,
      activity: s.activity || 'Coffee catch up',
      suggestedTime: s.suggestedTime || 'This weekend',
      reason: s.reason || "It's been a while — great excuse to catch up!",
      startIso: s.startIso || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      endIso: s.endIso || new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
    };
  });
}
