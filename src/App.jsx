import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Signup from './Auth/SignUp/Signup'
import Login from './Auth/Login/Login'
import VerifyEmail from './Auth/Verify Email/VerifyEmail'
import ForgetPassword from './Auth/ForgetPassword/ForgetPassword'
import VerifyPassword from './Auth/Verify Password/VerifyPassword'
import ResetPass from './Auth/ResetPass/ResetPass'
import Dashboard from './DashboardPage/Dashboard'

function App() {

  return (
    <>
      <Routes>
        <Route path='/signup' element={<Signup/>}></Route>
        <Route path='/VerifyEmail' element={<VerifyEmail/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/forgetPass' element={<ForgetPassword/>}></Route>
        <Route path='/verifyPass' element={<VerifyPassword/>}></Route>
        <Route path='/resetPass' element={<ResetPass/>}></Route>
        <Route path='/' element={<Dashboard/>}></Route>
      </Routes>
    </>
  )
}

export default App
