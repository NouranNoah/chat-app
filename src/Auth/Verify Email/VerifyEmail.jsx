import React, { useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import './VerifyEmail.css' 
import { useNavigate } from 'react-router-dom'

export default function VerifyEmail() {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const token = Cookies.get('emailToken')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await axios.post(
        'https://chat-app-api-production-7f75.up.railway.app/api/v1/auth/verifyEmailUser',
        { code },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        }
      )
      setMessage(response.data.message)
      console.log('loged')
      navigate('/login')
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.status === 400) {
        setError('Verification code is invalid or expired.') 
      }
      else if (err.response?.status === 401) {
        setError('the token is invalid or missing.') 
      }else {
        setError('Something went wrong, try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2 className="verify-title">Verify Your Email</h2>

        <form onSubmit={handleSubmit} className="verify-form">
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="verify-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="verify-button"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {message && <p className="verify-success">{message}</p>}
        {error && <p className="verify-error">{error}</p>}
      </div>
    </div>
  )
}
