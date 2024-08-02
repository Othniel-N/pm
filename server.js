// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://othniel:9865975475!Ao@pm.e1difni.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=pm', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define schema and model for OTP
const otpSchema = new mongoose.Schema({
    email: String,
    otp: String,
    createdAt: { type: Date, expires: '5m', default: Date.now }
});

const OTP = mongoose.model('OTP', otpSchema);

// Generate OTP and send email
app.post('/generate-otp', async (req, res) => {
    const { email } = req.body;

    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    try {
        await OTP.create({ email, otp });

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587, // Use 465 for SSL or 587 for TLS
            auth: {
                user: 'abs.othniel2023@gmail.com',
                pass: 'qwqtuyehlqusxvbx'
            }
        });

        const customMessage = `
            <html>
              <body>
                <p style="font-weight: bold; font-size: 16px;">We are happy to welcome you to <span style="color: #138af2;">Zetway Technologies</span>.</p>
                <p style="font-size: 16px;">Your OTP for login is <span style="font-weight: extra-bold; font-size: 24px; color: #138af2;">${otp}</span>.</p>
              </body>
            </html>
        `;

        await transporter.sendMail({
            from: 'Zetway <abs.othniel2023@gmail.com>',
            to: email,
            subject: 'Your OTP',
            html: customMessage
        });

        res.status(200).send('OTP sent successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending OTP');
    }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await OTP.findOne({ email, otp }).exec();

        if (otpRecord) {
            res.status(200).send('OTP verified successfully');
        } else {
            res.status(400).send('Invalid OTP');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error verifying OTP');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
