
import { google } from 'googleapis';
import db from '../db.js';

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/google/callback'
  );
}

async function getAuthClientForUser(userId) {
  const res = await db.query(
    'SELECT id, email, google_access_token, google_refresh_token FROM users WHERE id = $1',
    [userId]
  );
  const user = res.rows[0];
  if (!user?.google_access_token) return null;

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token:  user.google_access_token,
    refresh_token: user.google_refresh_token,
  });

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await db.query(
        'UPDATE users SET google_access_token = $1 WHERE id = $2',
        [tokens.access_token, userId]
      );
    }
  });

  return { client: oauth2Client, email: user.email };
}

async function createEventForUser(userId, eventDetails) {
  const auth = await getAuthClientForUser(userId);
  if (!auth) return null;

  const calendar = google.calendar({ version: 'v3', auth: auth.client });

  const event = {
    summary:     eventDetails.title,
    description: eventDetails.note || '',
    start: { dateTime: eventDetails.startTime, timeZone: 'UTC' },
    end:   { dateTime: eventDetails.endTime,   timeZone: 'UTC' },
    attendees: (eventDetails.attendeeEmails || []).map(email => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'none', 
    });
    return response.data.id;
  } catch (err) {
    console.error(`Failed to create calendar event for user ${userId}:`, err.message);
    return null;
  }
}

export async function createMeetupInCalendars(meetupId, hostId, guestId) {
  const meetupRes = await db.query(
    'SELECT title, start_time, end_time, note FROM meetups WHERE id = $1',
    [meetupId]
  );
  const meetup = meetupRes.rows[0];
  if (!meetup) throw new Error('Meetup not found');

  const usersRes = await db.query(
    'SELECT id, email FROM users WHERE id = ANY($1)',
    [[hostId, guestId]]
  );
  const emails = usersRes.rows.map(u => u.email);

  const eventDetails = {
    title:          meetup.title,
    note:           meetup.note,
    startTime:      meetup.start_time,
    endTime:        meetup.end_time,
    attendeeEmails: emails,
  };

  const [hostEventId, guestEventId] = await Promise.all([
    createEventForUser(hostId,  eventDetails),
    createEventForUser(guestId, eventDetails),
  ]);

  if (hostEventId) {
    await db.query(
      'UPDATE meetups SET gcal_event_id = $1 WHERE id = $2',
      [hostEventId, meetupId]
    );
  }

  return { hostEventId, guestEventId };
}
