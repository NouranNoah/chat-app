import React, { useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './ResetPass.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = Cookies.get('resetToken'); 
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.put(
        "https://chat-app-api-production-7f75.up.railway.app/api/v1/auth/resetPassword",
        {
          newPassword,
          passwordConfirm
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          }
        }
      );

      setMessage("✅ Password reset successfully!");
      Cookies.remove('resetToken'); 
      Cookies.set('jwtToken', response.data.token); 
      setTimeout(() => navigate('/'), 1500); 
    } catch (err) {
      if (err.response?.status === 400) {
        setError("Invalid input data.");
      } else if (err.response?.status === 401) {
        setError("Unauthorized or token expired.");
      } else {
        setError("Something went wrong.");
      }
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="verify-form">
      <h2 className="verify-title">🔑 Reset Password</h2>

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="verify-input"
        required
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        className="verify-input"
        required
      />

      <button type="submit" className="verify-button">
        Reset Password
      </button>

      {message && <p className="verify-success">{message}</p>}
      {error && <p className="verify-error">{error}</p>}
    </form>
  );
};

export default ResetPassword;
