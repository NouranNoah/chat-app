import React, { useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import './VerifyPassword.css';

const VerifyResetCode = () => {
  const [resetCode, setResetCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = Cookies.get('resetToken')
  const navigate = useNavigate()

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        "https://chat-app-api-production-7f75.up.railway.app/api/v1/auth/verifyResetCode",
        {
          resetCode: token
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          }
        }
      );

      setMessage("✅ Code verified successfully!");
      navigate('/resetPass')
    } catch (err) {
      if (err.response?.status === 400) {
        setError("Reset code is invalid or expired.");
      } else if (err.response?.status === 401) {
        setError("Unauthorized: Missing or invalid token.");
      } else {
        setError("Something went wrong.");
      }
    }
  };

  return (
    <form onSubmit={handleVerifyCode} className="verify-form">
      <h2 className="verify-title">Verify Reset Code</h2>
      
      <input
        type="text"
        placeholder="Enter the reset code"
        value={resetCode}
        onChange={(e) => setResetCode(e.target.value)}
        className="verify-input"
        required
      />

      <button type="submit" className="verify-button">
        Verify Code
      </button>

      {message && <p className="verify-success">{message}</p>}
      {error && <p className="verify-error">{error}</p>}
    </form>
  );
};

export default VerifyResetCode;
