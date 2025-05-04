import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';
import './Chat.css';

export default function Chat() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const updateUserStatus = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          lastSeen: serverTimestamp(),
          username: currentUser.displayName || currentUser.email.split('@')[0],
          email: currentUser.email
        });
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    };

    updateUserStatus();
    const statusInterval = setInterval(updateUserStatus, 20000);

    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, snapshot => {
      const usersList = snapshot.docs.map(doc => {
        const userData = doc.data();
        const isNadakenawy = userData.email === 'nadakenawy8@gmail.com';
        return {
          id: doc.id,
          username: userData.username || 'Unknown',
          email: userData.email || 'No email',
          lastSeen: userData.lastSeen ? new Date(userData.lastSeen.seconds * 1000) : null,
          isOnline: isNadakenawy ? true : (userData.lastSeen ? (new Date() - new Date(userData.lastSeen.seconds * 1000)) < 30000 : false)
        };
      });
      setUsers(usersList);
    });

    return () => {
      clearInterval(statusInterval);
      unsubscribeUsers();
    };
  }, [currentUser]);

  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribeMessages = onSnapshot(messagesQuery, snapshot => {
      const messagesList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          message: data.message,
          senderId: data.id,
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : null
        };
      });

      // ترتيب الرسائل تصاعديًا حسب الوقت (الأقدم أولاً)
      messagesList.sort((a, b) => {
        if (!a.createdAt) return -1;
        if (!b.createdAt) return 1;
        return a.createdAt - b.createdAt;
      });

      setMessages(messagesList);
    }, (error) => {
      console.error('Error in messages listener:', error);
    });

    return () => unsubscribeMessages();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('حدث خطأ في تسجيل الخروج');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        message: newMessage,
        id: currentUser.email,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'messages'), messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('حدث خطأ في إرسال الرسالة');
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    try {
      return date.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="chat-container">
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="close-error">
            ×
          </button>
        </div>
      )}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>كل المستخدمين ({users.length})</h3>
          <button onClick={handleSignOut} className="sign-out-btn">
            تسجيل الخروج
          </button>
        </div>
        <div className="users-list">
          {users.length === 0 ? (
            <div className="no-users">لا يوجد مستخدمين</div>
          ) : (
            users.map(user => (
              <div key={user.id} className={`user-item ${user.isOnline ? 'online' : 'offline'}`}>
                <div className="user-avatar">{user.username[0]}</div>
                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                  <span className="user-email">{user.email}</span>
                  <span className={`user-status ${user.isOnline ? 'online' : 'offline'}`}
                    style={{fontWeight: 'bold'}}>
                    {user.isOnline ? 'متصل الآن' : 'غير متصل'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <h2>الشات الجماعي</h2>
        </div>
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">لا توجد رسائل بعد</div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.senderId === currentUser.email ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <div className="message-sender-email" style={{fontWeight: 'bold', color: '#4a90e2', marginBottom: 4}}>
                    {message.senderId}
                  </div>
                  <span className="message-text">{message.message}</span>
                  <span className="message-time">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={sendMessage} className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالة..."
          />
          <button type="submit">إرسال</button>
        </form>
      </div>
    </div>
  );
}
