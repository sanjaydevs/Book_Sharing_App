import pool from "../db.js";
import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/search", async (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Search query is required" });
    }

    try {
        const result = await pool.query("Select books.id, books.title, books.author,books.image, users.name AS owner_name, users.email AS owner_email FROM books JOIN users ON books.owner_id = users.id WHERE books.title ILIKE $1", [`%${title}%`]);

        res.json(result.rows);
    } catch (err) {
        console.error("Search error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

router.post("/add", verifyToken, async (req, res) => {
    const {title,author,image} =req.body
    const userId= req.user.userId;

    if (!title || !author) {
        return res.status(400).json({error:"Title and Author are required"})    
    }

    try{
        const result = await pool.query("INSERT INTO books (title, author, owner_id,image) VALUES ($1, $2, $3,$4) RETURNING *",[title,author,userId,image]);
        res.status(201).json({book:result.rows[0]});
    } catch(err){
        console.error("Add book error:", err.message);
        res.status(500).json({error:"Server Error"});
    }
});


router.get("/me", verifyToken, async (req, res) => {
    const userId=req.user.userId;

    try{
        const result = await pool.query("SELECT id,title,author FROM books WHERE owner_id = $1",[userId]);
        res.json({books:result.rows})
    } catch (err){
        console.log("Fetch Books Error", err.message);
        res.status(500).json({error:"Server Error"});
    }
});

export default router;