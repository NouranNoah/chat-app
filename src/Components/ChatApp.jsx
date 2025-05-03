import React, { useEffect, useState } from 'react'
import './Chat.css'
import Sidebar from './Sidebar'
import ChatWindow from './ChatWindow'
import axios from 'axios'
import Cookies from 'js-cookie';

export default function ChatApp() {
    const [selectedUser, setSelectedUser] = useState(null)
    const [users, setUsers] = useState([]) 
    const token = Cookies.get('authToken');
    

    const getUsers = async () => {
        try {
          const response = await axios.get('https://chat-app-api-production-7f75.up.railway.app/api/v1/users',{
            headers: { Authorization: token }
          })
          
          setUsers(response.data.data) 
        } catch (error) {
          console.error('Failed to load users:', error)
        }
      }

    useEffect(()=>{
        getUsers();
    },[])
  
  return (
    <div className="chat-app">
      <Sidebar users={users} onSelectUser={setSelectedUser} />
      <ChatWindow selectedUser={selectedUser} />
    </div>
  )
}
