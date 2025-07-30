import pool from "../db.js";
import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/:book_id", verifyToken, async (req,res)=>{
    const book_id = req.params.book_id;
    const requester_id = req.user.userId;

    try {
        console.log("Request incoming")
        const check = await pool.query("Select * from requests where book_id = $1 and requester_id = $2 and status!='returned'", [book_id, requester_id]);

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
        const result = await pool.query("SELECT requests.*, books.title, books.author, books.image, books.owner_id AS receiver_id, users.name AS owner_name,requests.requester_id AS sender_id FROM requests JOIN books ON requests.book_id = books.id JOIN users ON books.owner_id = users.id WHERE requests.requester_id = $1 and requests.status !='returned'",
            [requester_id]);
        
            res.json({requests:result.rows});
    } catch (err){
        console.error("Fetch Requests Error", err.message);
        res.status(500).json({error:"Server Error"});
    }
});

router.get("/my-requests", verifyToken, async (req, res) => {
    const owner_id = req.user.userId;

    try {
        const result = await pool.query("Select requests.*, books.title, books.author, books.image, books.owner_id AS receiver_id, users.name AS requester_name, requests.requester_id AS sender_id FROM requests JOIN books ON requests.book_id = books.id JOIN users ON requests.requester_id = users.id WHERE books.owner_id = $1 and requests.status!='returned'",
            [owner_id]);
        
        res.json({requests:result.rows});
    } catch (err){
        console.error("Fetch Incoming Requests Error", err.message);
        res.status(500).json({error:"Server Error"});
    }
});

router.post("/:request_id/accept", verifyToken, async (req, res) => {
    const request_id = req.params.request_id;
    const owner_id = req.user.userId;
    console.log("Accept trying")

    try {
        const request = await pool.query(`SELECT requests.*, books.owner_id FROM requests JOIN books ON requests.book_id = books.id WHERE requests.id = $1`, [request_id]);

        if (request.rows.length === 0) {
            return res.status(404).json({error: "Request not found"});
        }

        if (request.rows[0].owner_id !== owner_id) {
            return res.status(403).json({error: "You are not authorized to accept this request"});
        }

        const book_id = request.rows[0].book_id;

        await pool.query("UPDATE requests SET status='accepted' WHERE id=$1", [request_id]);

        await pool.query("UPDATE requests SET status = 'rejected' WHERE book_id = $1 AND id != $2 AND status = 'pending'", [book_id, request_id]);

        await pool.query("UPDATE books SET available = false WHERE id = $1", [book_id]);
        
        res.json({message: "Request accepted successfully"});
    } catch (err) {
        console.error("Accept Request Error", err.message);
        res.status(500).json({error: "Server Error"});
    }
});

router.post("/:request_id/reject", verifyToken, async (req, res) => {
    try {
        const request_id = req.params.request_id;

        await pool.query("UPDATE requests SET status='rejected' WHERE id=$1",[request_id]);

        res.json({ message: "Request rejected" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/:request_id", verifyToken, async (req, res) => {
    try {
    const request_id = req.params.request_id;
    const requester_id=req.user.userId

    const result = await pool.query(
      "DELETE FROM requests WHERE id=$1 AND requester_id=$2 RETURNING *",
        [request_id, requester_id]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: "Request not found or unauthorized" });
    }

        res.json({ message: "Request cancelled" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});


router.patch('/:request_id/confirm', verifyToken, async (req, res) => {
    console.log("Inside /confirm route");

    const requestId = req.params.request_id;
    
    const userId = req.user.userId;


  try {
    // Get the request
    const result = await pool.query('SELECT requests.*, books.owner_id AS owner_id FROM requests JOIN books ON requests.book_id = books.id JOIN users ON books.owner_id = users.id WHERE requests.id = $1; ', [requestId]);
    const request = result.rows[0];

    let senderConfirmed = request.sender_confirmed;
    let receiverConfirmed = request.receiver_confirmed;

    const parsedUserId = parseInt(userId);
    // Decide which party is confirming
    if (parseInt(userId) === request.requester_id) {
      senderConfirmed = true;
    } else if (parseInt(userId) === request.owner_id) {
      receiverConfirmed = true;
    }

    console.log("requestId:", requestId);
    console.log("parsedUserId:", parsedUserId);
    console.log("request.requester_id:", request.requester_id);
    console.log("request.owner_id:", request.owner_id);
    console.log("senderConfirmed:", senderConfirmed);
    console.log("receiverConfirmed:", receiverConfirmed);


    // Update confirmations
    await pool.query(
      `UPDATE requests 
       SET sender_confirmed = $1, receiver_confirmed = $2 
       WHERE id = $3`,
      [senderConfirmed, receiverConfirmed, requestId]
    );


    // If both confirmed, mark as exchanged and book unavailable
    if (senderConfirmed && receiverConfirmed) {
      await pool.query(
        `UPDATE requests SET is_exchanged = true WHERE id = $1`,
        [requestId]
      );
      await pool.query(
        `UPDATE books SET available = false WHERE id = $1`,
        [request.book_id]
      );
    }

    res.status(200).json({ message: "Confirmation updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

router.post("/:id/return", verifyToken, async (req, res) => {
  const requestId = req.params.id;
  const userId = req.user.userId;

  
  try {
    const { rows } = await pool.query(
      `SELECT r.id AS request_id, r.requester_id AS sender_id,
              r.book_id AS book_id, 
              b.owner_id AS receiver_id, r.sender_returned, r.receiver_returned 
       FROM requests r 
       JOIN books b ON r.book_id = b.id 
       WHERE r.id = $1`,
      [requestId]
    );

    if (!rows[0]) return res.status(404).json({ error: "Not found" });

    const reqRow = rows[0];
    let { request_id,book_id,sender_returned, receiver_returned } = reqRow;

    if (parseInt(userId) === parseInt(reqRow.sender_id)) {
      sender_returned = true;
    } else if (parseInt(userId) === parseInt(reqRow.receiver_id)) {
      receiver_returned = true;
    } else {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const is_returned = sender_returned && receiver_returned;

    await pool.query(
      `UPDATE requests
       SET sender_returned = $1, receiver_returned = $2, is_returned = $3
       WHERE id = $4`,
      [sender_returned, receiver_returned, is_returned, requestId]
    );

    console.log(request_id);

    if (is_returned) {
      await pool.query("UPDATE books SET available = $1 WHERE id = $2",[is_returned,book_id])
      await pool.query("UPDATE requests SET status = 'returned' WHERE id = $1",[request_id]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});


export default router;