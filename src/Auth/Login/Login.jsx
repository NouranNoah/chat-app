import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(
        'https://chat-app-api-production-7f75.up.railway.app/api/v1/auth/login',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage('Login successful!');
      Cookies.set('authToken', response.data.token);
      navigate('/chat');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      }else if (err.response?.status === 400) {
        setError('input data is invalid.') 
      } else if (err.response?.status === 401) {
        setError('the email or password is incorrect') 
      } else {
        setError('Something went wrong, try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className='forget'><Link to='/forgetPass' style={{color:'#333'}}>Forget Password?</Link></div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msgL">{error}</p>}
      </div>
    </div>
  );
}
