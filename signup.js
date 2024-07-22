const express = require('express');
const connectDB = require('./database');
const app = express();
const port = 3000;

// Connect to the database
connectDB();

app.get('/check', (req, res) => {
  res.send('Server is running and connected to the database!');
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
