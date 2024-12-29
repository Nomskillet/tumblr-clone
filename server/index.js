// Updated index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
    } else {
        console.log('Connected to the database.');
    }
});

// Middleware to authenticate routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Fetch posts
app.get('/posts', (req, res) => {
    const query = 'SELECT * FROM posts ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching posts:', err);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});

// Create a new post with an image and caption
app.post('/posts', authenticateToken, upload.single('image'), (req, res) => {
    const { caption } = req.body;

    if (!req.file || !caption) {
        console.error('Image or caption missing');
        return res.status(400).json({ error: 'Image and caption are required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const query = 'INSERT INTO posts (image, caption) VALUES (?, ?)';
    db.query(query, [imageUrl, caption], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Server error');
        } else {
            res.status(201).json({ id: results.insertId, image: imageUrl, caption });
        }
    });
});

// Delete a post
app.delete('/posts/:id', authenticateToken, (req, res) => {
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

// User registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err) => {
        if (err) {
            console.error('Error registering user:', err);
            res.status(500).send('Server error');
        } else {
            res.status(201).json({ message: 'User registered successfully' });
        }
    });
});

// User login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token, username: user.username });
    });
});