require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: String,
  otpExpiresAt: Date,
});

const User = mongoose.model("User", userSchema);

// Email Configuration
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Generate OTP and send it via email
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send("Email is required");

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

  try {
    // Save or update OTP in database
    await User.findOneAndUpdate(
      { email },
      { email, otp, otpExpiresAt },
      { upsert: true }
    );

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send("OTP sent to your email.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending OTP");
  }
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).send("Invalid or expired OTP");
    }

    res.status(200).send("OTP verified successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error verifying OTP");
  }
});
