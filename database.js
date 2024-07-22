const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Replace <password> with your actual MongoDB password
    const conn = await mongoose.connect('mongodb+srv://othniel:<password>@pm.e1difni.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=pm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
