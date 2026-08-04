// temporary program to create dummy dataa for testing GG 
import pg from 'pg';
import { randomUUID } from 'crypto';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const users = [
  { name: 'Anjneya', email: 'anjneya@orbit.app' },
  { name: 'Sidhi',   email: 'sidhi@orbit.app'   },
  { name: 'Rohan',   email: 'rohan@orbit.app'   },
  { name: 'Karnika', email: 'karnika@orbit.app' },
  { name: 'Tanishq', email: 'tanishq@orbit.app' },
];

const friendMeta = {
  Sidhi:   { interests: ['coffee', 'hiking'],          last_met: daysAgo(14) },
  Rohan:   { interests: ['gaming', 'cricket'],          last_met: daysAgo(31) },
  Karnika: { interests: ['design', 'travel'],           last_met: daysAgo(3)  },
  Tanishq: { interests: ['machine learning', 'badminton'], last_met: daysAgo(7) },
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function slotsForUser(userId) {
  const slots = [];
  for (let day = 0; day < 7; day++) {
    const base = new Date();
    base.setDate(base.getDate() + day);
    base.setSeconds(0, 0);

    const morningStart = new Date(base);
    morningStart.setHours(8, 0);
    const morningEnd = new Date(base);
    morningEnd.setHours(10, 0);

    const eveningStart = new Date(base);
    eveningStart.setHours(18, 0);
    const eveningEnd = new Date(base);
    eveningEnd.setHours(20, 0);

    if (day % 3 !== 0) {
      slots.push({ user_id: userId, start_time: morningStart.toISOString(), end_time: morningEnd.toISOString() });
    }
    if (day % 2 === 0) {
      slots.push({ user_id: userId, start_time: eveningStart.toISOString(), end_time: eveningEnd.toISOString() });
    }
  }
  return slots;
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM meetup_participants');
    await client.query('DELETE FROM meetups');
    await client.query('DELETE FROM availability');
    await client.query('DELETE FROM friendships');
    await client.query('DELETE FROM users');
    console.log('Cleared existing data.');

    const userMap = {};
    for (const u of users) {
      const id = randomUUID();
      await client.query(
        'INSERT INTO users (id, name, email, created_at) VALUES ($1, $2, $3, NOW())',
        [id, u.name, u.email]
      );
      userMap[u.name] = id;
      console.log(`Created user: ${u.name} (${id})`);
    }

    const anjneyaId = userMap['Anjneya'];
    for (const [friendName, meta] of Object.entries(friendMeta)) {
      const friendId = userMap[friendName];
      await client.query(
        `INSERT INTO friendships (id, user_id, friend_id, status, last_met, interests, created_at)
         VALUES ($1, $2, $3, 'accepted', $4, $5, NOW()),
                ($6, $3, $2, 'accepted', $4, $5, NOW())`,
        [randomUUID(), anjneyaId, friendId, meta.last_met, meta.interests,
         randomUUID()]
      );
      console.log(`Linked friendship: Anjneya <-> ${friendName}`);
    }

    for (const [name, userId] of Object.entries(userMap)) {
      const slots = slotsForUser(userId);
      for (const s of slots) {
        await client.query(
          'INSERT INTO availability (id, user_id, start_time, end_time) VALUES ($1, $2, $3, $4)',
          [randomUUID(), s.user_id, s.start_time, s.end_time]
        );
      }
      console.log(`Inserted ${slots.length} availability slots for ${name}`);
    }

    const meetupId = randomUUID();
    const meetupStart = new Date();
    meetupStart.setDate(meetupStart.getDate() + 1);
    meetupStart.setHours(16, 0, 0, 0);
    const meetupEnd = new Date(meetupStart);
    meetupEnd.setHours(17, 30, 0, 0);

    await client.query(
      `INSERT INTO meetups (id, title, start_time, end_time, status, host_id)
       VALUES ($1, $2, $3, $4, 'scheduled', $5)`,
      [meetupId, 'Coffee w/ Sidhi', meetupStart.toISOString(), meetupEnd.toISOString(), anjneyaId]
    );
    await client.query(
      `INSERT INTO meetup_participants (meetup_id, user_id, status) VALUES ($1, $2, 'accepted'), ($1, $3, 'accepted')`,
      [meetupId, anjneyaId, userMap['Sidhi']]
    );
    console.log('Created upcoming meetup: Coffee w/ Sidhi');

    await client.query('COMMIT');
    console.log('\n✅ Seed complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed, rolled back:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
