import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'


export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://chat-app-api-production-7f75.up.railway.app/api/v1/auth/forgotPassword',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage(response.data.message || 'Reset code sent to your email.');
      Cookies.set('resetToken', response.data.token)
      navigate('/verifyPass')
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No user found with this email.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-form">
        <h2>Forgot Password</h2>
        <form onSubmit={handleForgotPassword}>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>

        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msgL">{error}</p>}
      </div>
    </div>
  );
}
