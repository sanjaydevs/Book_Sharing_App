import express from "express";
import pool from "../db.js"


const router = express.Router();

// Send message
router.post('/', async (req, res) => {
    const { requestId, senderId, content } = req.body;

    try {
    const result = await pool.query(
        `INSERT INTO messages (request_id, sender_id, content)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [requestId, senderId, content]
    );
    res.status(201).json(result.rows[0]);
    } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
    }
});


//  Get messages
router.get('/:requestId', async (req, res) => {
    const { requestId } = req.params;

    try {
    const result = await pool.query(
      `SELECT * FROM messages
        WHERE request_id = $1
        ORDER BY timestamp ASC`,
        [requestId]
        );
    res.status(200).json(result.rows);
    } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

export default router;