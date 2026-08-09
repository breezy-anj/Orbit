
import { google } from 'googleapis';
import db from '../db.js';
import { randomUUID } from 'crypto';

const WORK_START_HOUR = 8;   
const WORK_END_HOUR   = 22;  
const SYNC_DAYS       = 14;  

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/google/callback'
  );
}

async function getAuthClientForUser(user) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token:  user.google_access_token,
    refresh_token: user.google_refresh_token,
  });

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await db.query(
        'UPDATE users SET google_access_token = $1 WHERE id = $2',
        [tokens.access_token, user.id]
      );
    }
  });

  return oauth2Client;
}

function computeFreeSlots(date, busyIntervals) {
  const freeSlots = [];
  const dayStart = new Date(date);
  dayStart.setUTCHours(WORK_START_HOUR, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(WORK_END_HOUR, 0, 0, 0);

  let cursor = dayStart;

  for (const busy of busyIntervals) {
    const busyStart = new Date(busy.start);
    const busyEnd   = new Date(busy.end);

    if (busyStart > dayEnd) break;
    if (busyEnd <= cursor)  continue;

    if (busyStart > cursor) {
      freeSlots.push({ start: new Date(cursor), end: new Date(busyStart) });
    }
    if (busyEnd > cursor) cursor = busyEnd;
  }

  if (cursor < dayEnd) {
    freeSlots.push({ start: new Date(cursor), end: new Date(dayEnd) });
  }

  return freeSlots.filter(s => (s.end - s.start) >= 30 * 60 * 1000);
}

export async function syncCalendarForUser(userId) {
  
  const userRes = await db.query(
    'SELECT id, name, email, google_access_token, google_refresh_token FROM users WHERE id = $1',
    [userId]
  );
  const user = userRes.rows[0];

  if (!user?.google_access_token) {
    throw new Error('User has not connected Google Calendar. Please sign in with Google first.');
  }

  const auth = await getAuthClientForUser(user);
  const calendar = google.calendar({ version: 'v3', auth });

  const now    = new Date();
  const future = new Date(now);
  future.setDate(future.getDate() + SYNC_DAYS);

  let allEvents = [];
  let pageToken;
  do {
    const resp = await calendar.events.list({
      calendarId:   'primary',
      timeMin:      now.toISOString(),
      timeMax:      future.toISOString(),
      singleEvents: true,
      orderBy:      'startTime',
      maxResults:   250,
      pageToken,
    });
    allEvents = allEvents.concat(resp.data.items || []);
    pageToken = resp.data.nextPageToken;
  } while (pageToken);

  const busyIntervals = [];
  const socialEvents  = [];

  for (const ev of allEvents) {
    if (ev.status === 'cancelled') continue;
    const start = ev.start?.dateTime || ev.start?.date;
    const end   = ev.end?.dateTime   || ev.end?.date;
    if (!start || !end) continue;

    busyIntervals.push({ start, end });

    const attendees = ev.attendees || [];
    const others = attendees.filter(a => !a.self && a.responseStatus !== 'declined');
    if (others.length > 0) {
      socialEvents.push({
        gcal_id:   ev.id,
        title:     ev.summary || 'Untitled Event',
        start,
        end,
        attendees: others.map(a => ({ email: a.email, name: a.displayName || a.email })),
      });
    }
  }

  busyIntervals.sort((a, b) => new Date(a.start) - new Date(b.start));

  const freeSlots = [];
  for (let d = 0; d < SYNC_DAYS; d++) {
    const day = new Date(now);
    day.setDate(day.getDate() + d);
    day.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(day);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const dayBusy = busyIntervals.filter(b =>
      new Date(b.start) < dayEnd && new Date(b.end) > day
    );

    const slots = computeFreeSlots(day, dayBusy);
    freeSlots.push(...slots);
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM availability WHERE user_id = $1', [userId]);

    for (const slot of freeSlots) {
      await client.query(
        `INSERT INTO availability (id, user_id, start_time, end_time, timezone)
         VALUES ($1, $2, $3, $4, 'UTC')`,
        [randomUUID(), userId, slot.start.toISOString(), slot.end.toISOString()]
      );
    }

    for (const ev of socialEvents) {
      
      const existing = await client.query(
        `SELECT id FROM meetups WHERE host_id = $1 AND title = $2
         AND ABS(EXTRACT(EPOCH FROM (start_time - $3::timestamptz))) < 60`,
        [userId, ev.title, ev.start]
      );

      let meetupId;
      if (existing.rows.length > 0) {
        meetupId = existing.rows[0].id;
        await client.query(
          `UPDATE meetups SET start_time = $1, end_time = $2 WHERE id = $3`,
          [ev.start, ev.end, meetupId]
        );
      } else {
        meetupId = randomUUID();
        await client.query(
          `INSERT INTO meetups (id, title, start_time, end_time, status, host_id)
           VALUES ($1, $2, $3, $4, 'scheduled', $5)`,
          [meetupId, ev.title, ev.start, ev.end, userId]
        );
        
        await client.query(
          `INSERT INTO meetup_participants (meetup_id, user_id, status)
           VALUES ($1, $2, 'accepted') ON CONFLICT DO NOTHING`,
          [meetupId, userId]
        );
      }

      for (const att of ev.attendees) {
        const friendRow = await client.query(
          'SELECT id FROM users WHERE email = $1', [att.email]
        );
        if (friendRow.rows.length > 0) {
          await client.query(
            `INSERT INTO meetup_participants (meetup_id, user_id, status)
             VALUES ($1, $2, 'accepted') ON CONFLICT DO NOTHING`,
            [meetupId, friendRow.rows[0].id]
          );
        }
      }
    }

    await client.query(
      'UPDATE users SET calendar_synced_at = NOW() WHERE id = $1', [userId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return {
    freeSlotsCount: freeSlots.length,
    meetupsCount:   socialEvents.length,
  };
}
