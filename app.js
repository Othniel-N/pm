const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const connectDB = require('./database');
const nodemailer = require('nodemailer');
const User = require('./user');
const loginRouter = require('./login');
const passwordsRouter = require('./passwords');
const app = express();
const port = 3000;

// Connect to the database
connectDB();

// Middleware to parse JSON
app.use(bodyParser.json());

// Use the login router
app.use('/api', loginRouter);

// Use the passwords router
app.use('/api/user', passwordsRouter);

// In-memory store for OTPs and user details (for simplicity)
const otpStore = {};

// Nodemailer transporter configuration for Hostinger
const transporter = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'ceo@zetway.in',
    pass: '9865975475!Ao', // Replace with the actual password
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log('Error with Nodemailer transporter:', error);
  } else {
    console.log('Nodemailer transporter is ready to send messages');
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Generate OTP
    const otp = crypto.randomBytes(3).toString('hex'); // Generates a 6-character OTP
    console.log(`Generated OTP for ${email}: ${otp}`);

    // Send OTP to user's email
    await transporter.sendMail({
      from: 'ceo@zetway.in',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    });

    // Store user details and OTP in memory with expiration time (e.g., 5 minutes)
    otpStore[email] = { username, email, password, otp, expires: Date.now() + 300000 };

    console.log(`Stored OTP for ${email}`);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.log('Error in /register route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Endpoint to create a new user
// app.post('/user', async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({ username, email, password: hashedPassword });
//     await newUser.save();
//     res.status(201).json({ message: 'User created successfully', user: newUser });
//   } catch (error) {
//     if (error.code === 11000) {
//       // Duplicate key error
//       res.status(400).json({ message: 'Username or email already exists' });
//     } else {
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   }
// });

// get all users

// Health check endpoint
app.get('/check', (req, res) => {
  res.send('Server is running and connected to the database!');
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
