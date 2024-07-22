const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const connectDB = require('./database');
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

// Endpoint to create a new user
app.post('/user', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({ message: 'Username or email already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Health check endpoint
app.get('/check', (req, res) => {
  res.send('Server is running and connected to the database!');
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
