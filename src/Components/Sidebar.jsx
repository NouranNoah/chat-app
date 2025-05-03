import React from 'react'

export default function Sidebar({ users, onSelectUser }) {
  return (
    <div className="sidebar">
    <h2>ChatApp</h2>
      <div className='users'>
      {users.map((user) => (
        <div
          key={user._id}
          className="user"
          onClick={() => onSelectUser(user)}
        >
          {user.username}
        </div>
      ))}
      </div>
    </div>
  )
}
