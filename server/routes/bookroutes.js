import pool from "../db.js";
import express from "express";
import verifyToken from "../middleware/verifyToken.js";


const router = express.Router();

router.get("/:id/profile", async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (Number.isNaN(userId)) return res.status(400).json({ error: "Invalid user id" });

  try {
    // 1) user basic info including location
    const userRes = await pool.query(
      `SELECT id, name, email, created_at,
              location_name, latitude, longitude, address
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userRes.rowCount === 0) return res.status(404).json({ error: "User not found" });
    const user = userRes.rows[0];

    // 2) fetch books owned by user
    const booksPromise = pool.query(
      `SELECT id, title, author, genre, available
       FROM books
       WHERE owner_id = $1
       ORDER BY id DESC`,
      [userId]
    );

    // 3) counts / stats
    const booksListedPromise = pool.query(
      `SELECT COUNT(*)::int AS count FROM books WHERE owner_id = $1`,
      [userId]
    );
    const booksSharedPromise = pool.query(
      `SELECT COUNT(*)::int AS count
       FROM requests r
       JOIN books b ON r.book_id = b.id
       WHERE b.owner_id = $1 AND r.is_exchanged = true`,
      [userId]
    );
    const booksBorrowedPromise = pool.query(
      `SELECT COUNT(*)::int AS count
       FROM requests
       WHERE requester_id = $1 AND is_exchanged = true`,
      [userId]
    );
    const exchangesPromise = pool.query(
      `SELECT COUNT(*)::int AS count
       FROM requests r
       JOIN books b ON r.book_id = b.id
       WHERE (b.owner_id = $1 OR r.requester_id = $1) AND r.is_exchanged = true`,
      [userId]
    );

    // 4) recent exchange history (last 10 completed)
    const historyPromise = pool.query(
      `SELECT r.id,
              b.id AS book_id,
              b.title,
              CASE
                WHEN b.owner_id = $1 THEN 'shared'
                WHEN r.requester_id = $1 THEN 'borrowed'
                ELSE 'other'
              END AS action,
              r.status,
              r.created_at
       FROM requests r
       JOIN books b ON r.book_id = b.id
       WHERE (b.owner_id = $1 OR r.requester_id = $1)
         AND r.is_exchanged = true
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [userId]
    );

    // run queries in parallel
    const [booksRes, booksListedRes, booksSharedRes, booksBorrowedRes, exchangesRes, historyRes] =
      await Promise.all([
        booksPromise,
        booksListedPromise,
        booksSharedPromise,
        booksBorrowedPromise,
        exchangesPromise,
        historyPromise,
      ]);

    // build response
    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      location: {
        location_name: user.location_name || null,
        latitude: user.latitude || null,
        longitude: user.longitude || null,
        address: user.address || null,
      },
      books: booksRes.rows,
      stats: {
        booksListed: booksListedRes.rows[0].count,
        booksShared: booksSharedRes.rows[0].count,
        booksBorrowed: booksBorrowedRes.rows[0].count,
        exchanges: exchangesRes.rows[0].count,
      },
      history: historyRes.rows,
    };

    return res.json(response);
  } catch (err) {
    console.error("GET /api/users/:id/profile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});




router.get("/search", async (req, res) => {
    const { title, author, genre, location, available,lat,lng,radius } = req.query;

    console.log(lat,lng);
    try{
        let query=`SELECT books.id, books.title, books.author, books.image, books.available,
            users.name AS owner_name, users.email AS owner_email, users.latitude, users.longitude, 

            (
            6731 * acos(
                cos(radians($1)) * cos(radians(users.latitude)) * 
                cos(radians(users.longitude) - radians($2)) + 
                sin(radians($1)) * sin(radians(users.latitude))
              )
            ) AS distance
            FROM books
            JOIN users ON books.owner_id = users.id
            WHERE 1=1`;

        const values=[lat || 0, lng || 0];
        let count=3;

        if(title){
            query+=` AND books.title ILIKE $${count}`; // $count give the number 1,2,3... $${count} gives $1,$2,$3....
            values.push(`${title}%`);  // We are adding % with the title, for sql query
            count++
        }

        if (author) {
            query += ` AND books.author ILIKE $${count}`;
            values.push(`%${author}%`);
            count++;
        }

        if (genre) {
            query += ` AND books.genre = $${count}`;
            values.push(genre);
            count++;
        }

        if (available) {
            query += ` AND books.available = $${count}`;
            values.push(available === "true"); // convert string to boolean
            count++;
        }   

        if (radius) {
          query += ` AND (
            6371 * acos(
              cos(radians($1)) * cos(radians(users.latitude)) * 
              cos(radians(users.longitude) - radians($2)) + 
              sin(radians($1)) * sin(radians(users.latitude))
            )
          ) <= $${count}`;
          values.push(radius);
          count++;
        }if (radius) {
          query += ` AND (
            6371 * acos(
              cos(radians($1)) * cos(radians(users.latitude)) * 
              cos(radians(users.longitude) - radians($2)) + 
              sin(radians($1)) * sin(radians(users.latitude))
            )
          ) <= $${count}`;
          values.push(radius);
          count++;
        }

        query += ` ORDER BY distance ASC` ;

        const result=await pool.query(query,values);
        res.json({books:result.rows});

    } catch (err) {
        console.error("Search error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

router.post("/add", verifyToken, async (req, res) => {
    const {title,author,image} =req.body
    const userId= req.user.userId;

    console.log("Add book called in backend");
    if (!title || !author) {
        return res.status(400).json({error:"Title and Author are required"})    
    }

    try{
        const result = await pool.query("INSERT INTO books (title, author, owner_id,image) VALUES ($1, $2, $3, COALESCE($4, 'noimage')) RETURNING *",[title,author,userId,image]);
        res.status(201).json({book:result.rows[0]});
    } catch(err){
        console.error("Add book error:", err);
        res.status(500).json({error:"Server Error"});
    }
});


router.get("/me", verifyToken, async (req, res) => {
    const userId=req.user.userId;

    try{
        const result = await pool.query("SELECT books.* FROM books WHERE owner_id = $1",[userId]);
        res.json({books:result.rows})
    } catch (err){
        console.log("Fetch Books Error", err.message);
        res.status(500).json({error:"Server Error"});
    }
});

router.get("/all",verifyToken, async (req,res) =>{
    const userId=req.user.userId;
    try{
        const result = await pool.query(`SELECT books.*, users.name AS owner_name , users.id as owner_id FROM books JOIN users ON books.owner_id = users.id WHERE books.owner_id != $1`,[userId])
        res.json({books:result.rows})
    } catch (err) {
        console.error("Fetch All Books Error", err.message);
        res.status(500).json({error:"Server Error"});
    }

});

export default router;