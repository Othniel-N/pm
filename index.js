const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('./user'); // Assuming you have a User model
const app = express();
app.use(express.json());

// In-memory store for OTPs and user details (for simplicity)
const otpStore = {};

// emailjs SMTP client configuration for Hostinger
const server = email.server.connect({
    user: 'hr@zetway.in',
    password: 'jks', // Replace with the actual password
    host: 'smtp.hostinger.com',
    ssl: true, // Use SSL
    port: 465, // Port for SSL
  });
  
  // Function to send an OTP email
  function sendOtp(emailAddress, otp) {
    return new Promise((resolve, reject) => {
      server.send({
        text: `Your OTP code is ${otp}`,
        from: 'hr@zetway.in',
        to: emailAddress,
        subject: 'Your OTP Code'
      }, (err, message) => {
        if (err) {
          reject(err);
        } else {
          resolve(message);
        }
      });
    });
  }
  
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
      await sendOtp(email, otp);
  
      // Store user details and OTP in memory with expiration time (e.g., 5 minutes)
      otpStore[email] = { username, email, password, otp, expires: Date.now() + 300000 };
  
      console.log(`Stored OTP for ${email}`);
      res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
      console.log('Error in /register route:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  })

app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Check if OTP is valid
    const otpEntry = otpStore[email];
    if (!otpEntry || otpEntry.otp !== otp || otpEntry.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(otpEntry.password, 10);

    // Create new user
    const newUser = new User({ username: otpEntry.username, email: otpEntry.email, password: hashedPassword });
    await newUser.save();

    // Clean up OTP store
    delete otpStore[email];

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.log('Error in /verify-otp route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
