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
import ChatApp from './Components/ChatApp'
import Sidebar from './Components/Sidebar'
import ChatWindow from './Components/ChatWindow'

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
        <Route path='/ChatApp' element={<ChatApp/>}></Route>
        <Route path='/Sidear' element={<Sidebar />}></Route>
        <Route path='/ChatWindow' element={<ChatWindow/>}></Route>
      </Routes>
    </>
  )
}

export default App
