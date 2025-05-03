import React, { useState } from 'react'
import './Signup.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'

export default function Signup() {
  const navigate = useNavigate()
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post(
        'https://chat-app-api-production-7f75.up.railway.app/api/v1/auth/signup',
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      Cookies.set('emailToken', response.data.token)
      console.log(response.data.token)
      setSuccess('Account created! Check your email to activate your account.📩')
      setErrors({})
      setIsLoading(false)

      setTimeout(() => {
        navigate('/VerifyEmail')
      }, 2000)

    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {}
        err.response.data.errors.forEach(error => {
          fieldErrors[error.path] = error.msg
        })
        setErrors(fieldErrors)
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message })
      } else {
        setErrors({ general: 'An error occurred while registering, try again' })
      }

      setSuccess('')
      setIsLoading(false)
    }
  }

  return (
    <div className="signup">
      <h2>SignUp</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="User Name"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {errors.username && <p className="error-msg">{errors.username}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="error-msg">{errors.email}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="error-msg">{errors.password}</p>}

        <input
          type="password"
          name="passwordConfirm"
          placeholder="Confirm Password"
          value={formData.passwordConfirm}
          onChange={handleChange}
          required
        />
        {errors.passwordConfirm && <p className="error-msg">{errors.passwordConfirm}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'SignUp'}
        </button>
      </form>

      {errors.general && <p className="error-msg">{errors.general}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  )
}
