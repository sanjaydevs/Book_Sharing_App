import pool from "../db.js";
import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/:book_id", verifyToken, async (req,res)=>{
    const book_id = req.params.book_id;
    const requester_id = req.user.userId;

    try {
        const check = await pool.query("Select * from requests where book_id = $1 and requester_id = $2", [book_id, requester_id]);

        if (check.rows.length > 0) {
            return res.status(400).json({message:"Request already sent"});
        }

        await pool.query("INSERT INTO requests (book_id,requester_id) VALUES ($1,$2)",[book_id,requester_id]);

        res.status(200).json({message:"Request Sent successfully"})

    } catch (err){
        console.error(err.message);
        res.status(500).json({error:"Server error"});
    }
});


router.get("/me", verifyToken, async (req, res) => {
    const requester_id = req.user.userId;

    try {
        const result = await pool.query("Select requests *, books.title, books.author, books.image from requests JOIN books on requests.book_id = books.id WHERE requester_id= $1",
            [requester_id]);
        
            res.json(result.rows);
    } catch (err){
        console.error("Fetch Requests Error", err.message);
        res.status(500).json({error:"Server Error"});
    }
});

router.get("/incoming", verifyToken, async (req, res) => {
    const owner_id = req.user.userId;

    try {
        const result = await pool.query("Select requests.*, books.title, books.author, books.image, users.name AS requester_name FROM requests JOIN books ON requests.book_id = books.id JOIN users ON requests.requester_id = users.id WHERE books.owner_id = $1",
            [owner_id]);
        
        res.json(result.rows);
    } catch (err){
        console.error("Fetch Incoming Requests Error", err.message);
        res.status(500).json({error:"Server Error"});
    }
});

router.post("/:request_id/accept", verifyToken, async (req, res) => {
    const request_id = req.params.request_id;
    const owner_id = req.user.userId;

    try {
        const request = await pool.query("SELECT * FROM requests WHERE id = $1", [request_id]);

        if (request.rows.length === 0) {
            return res.status(404).json({error: "Request not found"});
        }

        if (request.rows[0].owner_id !== owner_id) {
            return res.status(403).json({error: "You are not authorized to accept this request"});
        }

        await pool.query("UPDATE requests SET status='approved' WHERE id=$1", [request_id]);
        
        res.json({message: "Request accepted successfully"});
    } catch (err) {
        console.error("Accept Request Error", err.message);
        res.status(500).json({error: "Server Error"});
    }
});

router.post("/:request_id/reject", verifyToken, async (req, res) => {
    try {
        const request_id = req.params.request_id;

        await pool.query(
        "UPDATE requests SET status='rejected' WHERE id=$1",
        [request_id]
    );

        res.json({ message: "Request rejected" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/:request_id", verifyToken, async (req, res) => {
    try {
    const request_id = req.params.request_id;

        await pool.query(
        "DELETE FROM requests WHERE id=$1 AND requester_id=$2",
        [request_id, req.user.id]
    );

        res.json({ message: "Request cancelled" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;