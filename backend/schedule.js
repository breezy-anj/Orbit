import express from 'express';
import pool from '../db.js';
import { findCommonFreeSlots } from '../utils/scheduler.js';

const router = express.Router();

router.post('/find-slots', async (req, res) => {
    const { userIds, startDate, endDate, durationMinutes } = req.body;
    const minDurationMs = (durationMinutes || 60) * 60 * 1000;
    const searchStart = new Date(startDate);
    const searchEnd = new Date(endDate);

    try {
        const userBusyLists = [];

        for (const userId of userIds) {
            const resAvailability = await pool.query(
                'SELECT start_time, end_time FROM availability WHERE user_id = $1',
                [userId]
            );

            const userBusy = resAvailability.rows.map(row => ({
                start: new Date(row.start_time),
                end: new Date(row.end_time)
            }));

            userBusyLists.push(userBusy);
        }

        const freeSlots = findCommonFreeSlots(userBusyLists, searchStart, searchEnd, minDurationMs);
        res.json({ freeSlots });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
