require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Tumblr Clone API');
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

console.log('Database Host:', process.env.DB_HOST);

// Create a database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Fetch posts with optional pagination
app.get('/posts', (req, res) => {
    console.log('GET /posts endpoint hit');

    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 5; // Default to 5 posts per page
    const offset = (page - 1) * limit;

    const query = 'SELECT * FROM posts LIMIT ? OFFSET ?';
    db.query(query, [limit, offset], (err, results) => {
        if (err) {
            console.error('Error fetching posts:', err);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});

// Create a new post
app.post('/posts', (req, res) => {
    console.log('POST /posts endpoint hit');
    console.log('Request body:', req.body);

    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const query = 'INSERT INTO posts (title, content) VALUES (?, ?)';
    db.query(query, [title, content], (err, results) => {
        if (err) {
            console.error('Error creating post:', err);
            res.status(500).send('Server error');
        } else {
            res.status(201).json({ id: results.insertId, title, content });
        }
    });
});

// Delete a post
app.delete('/posts/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM posts WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting post:', err);
            res.status(500).send('Server error');
        } else if (results.affectedRows === 0) {
            res.status(404).send('Post not found');
        } else {
            res.status(200).send('Post deleted');
        }
    });
});

// Update a post
app.put('/posts/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    // Validate input
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const query = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
    db.query(query, [title, content, id], (err, results) => {
        if (err) {
            console.error('Error updating post:', err);
            res.status(500).send('Server error');
        } else if (results.affectedRows === 0) {
            res.status(404).send('Post not found');
        } else {
            res.status(200).json({ id, title, content });
        }
    });
});

