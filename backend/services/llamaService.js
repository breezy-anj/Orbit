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
const GROQ_MODEL   = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

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
    if (f.interests?.length) parts.push(`Interests: ${f.interests.join(', ')}`);
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
2. NEVER invent, assume, or hallucinate information not explicitly given above. Do not reference TV shows, books, hobbies, or past conversations unless they appear in FRIENDS data above.
3. Every suggestion must use a DIFFERENT activity type. Forbidden repeats: no two suggestions can both be "coffee", both be "dinner", or both be the same category.
4. Use a WIDE variety of activities: e.g. coffee/brunch, outdoor walk or hike, cooking together, board games, watching a movie, going to a market, playing a sport, attending a local event, a quick lunch.
5. If no interests are listed for a friend, base suggestions on TIME OF DAY from FREE_SLOTS: morning → breakfast or walk; afternoon → lunch or activity; evening → dinner, drinks, or movie.
6. "suggestedTime" MUST be a plain readable string like "Saturday evening" or "Sunday morning".
7. "startIso" and "endIso" MUST be exact ISO 8601 strings (e.g. "2026-08-08T18:00:00.000Z") representing a 2-hour window chosen from the provided FREE_SLOTS. Pick a reasonable time inside the slot's datetime.
8. "reason" must be one warm, genuine sentence. Only reference real data from above. If no context, write something like "It's been a while — a great excuse to catch up!"
9. "activity" must be specific (e.g. "Cook dinner together at home" not "Hang out").
10. Respond with ONLY valid JSON matching the schema. No extra text, no explanations.`;
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
   Groq provider (cloud — free tier Llama)
   ────────────────────────────────────────────── */
async function callGroq(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error(
      'GROQ_API_KEY is not set. Get a free key at https://console.groq.com and add it to your .env file.'
    );
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful AI that responds only with valid JSON.' },
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
    console.error('ML Prediction failed, falling back to provided freeSlots:', err.message);
  }

  const prompt = buildPrompt(payload);

  console.log(`[AI] Using provider: ${AI_PROVIDER}`);

  const parsed = AI_PROVIDER === 'groq'
    ? await callGroq(prompt)
    : await callOllama(prompt);

  return parsed.suggestions || [];
}
