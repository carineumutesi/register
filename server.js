require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let db;

async function connectDatabase() {
  try {
    db = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",      
      database: "auth_db"
    });
    console.log('=== STEP 1: Connected directly to the MySQL database smoothly! ===');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}
connectDatabase();

// ==========================================
// REGISTRATION ENDPOINT (WITH VISIBILITY LOGS)
// ==========================================
app.post('/api/register', async (req, res) => {
  console.log('\n--- 📥 NEW REGISTRATION REQUEST RECEIVED ---');
  console.log('Data sent by frontend:', req.body);

  const { firstName, lastName, location, email, password } = req.body;

  if (!firstName || !lastName || !location || !email || !password) {
    console.log('❌ Validation Failed: Missing fields in form submission.');
    return res.status(400).json({ message: 'All registration fields are required.' });
  }

  try {
    console.log(`Checking database if email [${email}] already exists...`);
    const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      console.log('❌ Conflict: Email is already registered in MySQL.');
      return res.status(409).json({ message: 'Email address is already registered.' });
    }

    console.log('Hashing raw password with bcrypt...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Inserting secure profile data row into MySQL users table...');
    const sql = 'INSERT INTO users (first_name, last_name, location, email, password) VALUES (?, ?, ?, ?, ?)';
    await db.execute(sql, [firstName, lastName, location, email, hashedPassword]);

    console.log('✅ SUCCESS: Data saved! Sending 201 response back to frontend.');
    return res.status(201).json({ message: 'Account registered successfully!' });

  } catch (error) {
    console.error('❌ MySQL Database Error:', error.message);
    return res.status(500).json({ message: 'Database query failed.', error: error.message });
  }
});

// ==========================================
// LOGIN ENDPOINT (WITH VISIBILITY LOGS)
// ==========================================
app.post('/api/login', async (req, res) => {
  console.log('\n--- 🔑 NEW LOGIN REQUEST RECEIVED ---');
  console.log('Credentials sent by frontend:', { email: req.body.email, password: '••••••••' });

  const { email, password } = req.body;

  if (!email || !password) {
    console.log('❌ Validation Failed: Missing email or password.');
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    console.log(`Searching MySQL for email: [${email}]...`);
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      console.log('❌ Fail: Email not found in database.');
      return res.status(401).json({ message: 'Invalid email or password.' }); 
    }

    const user = rows[0];
    console.log('User found! Verifying hashed password matching status...');
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      console.log('❌ Fail: Password password mismatch.');
      return res.status(401).json({ message: 'Invalid email or password.' }); 
    }

    console.log('Generating authentication JWT token structural payload...');
    const secretKey = process.env.JWT_SECRET || 'fallback_development_secret_key_12345';
    const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '2h' });

    console.log(`✅ SUCCESS: [${user.first_name}] authenticated! Sending token to browser.`);
    return res.status(200).json({
      message: 'Authentication successful!',
      token,
      user: { email: user.email, firstName: user.first_name }
    });

  } catch (error) {
    console.error('❌ Login Error:', error.message);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`=== STEP 2: Express Backend running on http://127.0.0.1:5000 ===`);
});