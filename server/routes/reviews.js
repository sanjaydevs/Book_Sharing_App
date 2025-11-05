import pool from "../db.js";
import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router=express.Router();

router.post('/',verifyToken, async (req,res)=>{
    const {reviewer_id, reviewed_user_id, request_id, rating, comment} = req.body;
    console.log({reviewer_id, reviewed_user_id, request_id, rating, comment});

    try{
        const query =`
        Insert into reviews (reviewer_id, reviewed_user_id, exchange_id, rating, comment) 
        VALUES ($1,$2,$3,$4,$5) 
        RETURNING *`;


        const {rows} = await pool.query(query,
            [reviewer_id, reviewed_user_id, request_id, rating, comment]
        );

        res.json(rows[0]);
    } catch (err) {
        console.error("Error Submitting reviews:", err.message);
        res.status(500).json({ error: "Failed to submit review", details: err.message });
    }
});

router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const query = `
        SELECT 
            r.id,
            r.comment,
            r.rating,
            r.created_at,
            u.name AS reviewer_name
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.id
        WHERE r.reviewed_user_id = $1
        ORDER BY r.created_at DESC;
        `;

        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching reviews:", err.message);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});


router.get("/average/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const { rows } = await pool.query(
        `
        SELECT ROUND(AVG(rating), 2) AS average_rating, COUNT(*) AS total_reviews
        FROM reviews
        WHERE reviewed_user_id = $1
        `,
        [userId]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch average rating" });
    }
});

router.get("/written/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const query = `
        SELECT r.*, u.name AS reviewed_user_name
        FROM reviews r
        JOIN users u ON r.reviewed_user_id = u.id
        WHERE r.reviewer_id = $1
        ORDER BY r.created_at DESC;
        `;
        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching written reviews:", err.message);
        res.status(500).json({ error: "Failed to fetch written reviews" });
    }
});


export default router;