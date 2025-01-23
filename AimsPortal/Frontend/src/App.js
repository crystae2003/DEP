import React, { useState } from "react";
import logo from "./CollegeLogo.png";
import axios from "axios";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter OTP
  const [message, setMessage] = useState("");

  const sendOtp = async () => {
    try {
      const response = await axios.post("http://localhost:5001/send-otp", { email });
      setMessage(response.data);
      setStep(2); // Move to OTP verification step
    } catch (error) {
      setMessage(error.response?.data || "Error sending OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post("http://localhost:5001/verify-otp", { email, otp });
      setMessage(response.data); // Display success message
    } catch (error) {
      setMessage(error.response?.data || "Invalid or expired OTP");
    }
  };

  return (
    <div className="container">
      {/* Left Section */}
      <div className="left-section">
        <img src={logo} className="college-logo" alt="College Logo" />
      </div>

      {/* Right Section */}
      <div className="right-section">
        <h1 className="brand-name">AIMS</h1>

        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendOtp();
            }}
          >
            <label>Email</label>
            <input
              type="text"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="send-otp-btn">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyOtp();
            }}
          >
            <label>OTP</label>
            <input
              type="text"
              placeholder="Enter the OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit" className="send-otp-btn">Verify OTP</button>
          </form>
        )}

        {message && <p className="message">{message}</p>}

        {step === 2 && (
          <p className="create-account">
            Didn’t receive OTP? <a href="/" onClick={() => setStep(1)}>Resend</a>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
