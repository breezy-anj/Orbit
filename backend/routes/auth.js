import express from 'express';
import { google } from 'googleapis';
import db from '../db.js';
import { randomUUID } from 'crypto';

const router = express.Router();

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/google/callback'
  );
}

function makeJwt(userId) {
  
  return 'orbit-jwt-' + userId;
}

router.get('/google', (req, res) => {
  const oauth2Client = getOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',            
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:5174'}/login?error=${error}`
    );
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const profile = await oauth2.userinfo.get();

    const email = profile.data.email;
    const name  = profile.data.name || email;

    if (!email) throw new Error('Could not retrieve email from Google profile');

    const upsert = await db.query(
      `INSERT INTO users (id, name, email, google_access_token, google_refresh_token, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (email)
       DO UPDATE SET
         name                 = EXCLUDED.name,
         google_access_token  = EXCLUDED.google_access_token,
         google_refresh_token = COALESCE(EXCLUDED.google_refresh_token, users.google_refresh_token)
       RETURNING id, name, email`,
      [
        randomUUID(),
        name,
        email,
        tokens.access_token,
        tokens.refresh_token || null,
      ]
    );

    const user  = upsert.rows[0];
    const token = makeJwt(user.id);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    const params = new URLSearchParams({
      token,
      userId: user.id,
      name:   user.name,
      email:  user.email,
    });
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  } catch (err) {
    console.error('OAuth callback error:', err.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
});

router.get('/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user: req.user });
});

export default router;
