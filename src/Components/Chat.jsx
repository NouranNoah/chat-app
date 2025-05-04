import React, { useState, useEffect, useRef } from 'react';
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
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import './Chat.css';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { IoMdSend } from 'react-icons/io';

export default function Chat() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef(null);

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
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : null,
          reactions: data.reactions || {},
          seenBy: data.seenBy || []
        };
      });

      messagesList.sort((a, b) => {
        if (!a.createdAt) return -1;
        if (!b.createdAt) return 1;
        return a.createdAt - b.createdAt;
      });

      setMessages(messagesList);
      setLoadingMessages(false);
    }, (error) => {
      console.error('Error in messages listener:', error);
      setLoadingMessages(false);
    });

    return () => unsubscribeMessages();
  }, []);

  // تحديث حالة المشاهدة عند عرض الرسالة
  useEffect(() => {
    if (!messages.length || !currentUser) return;
    messages.forEach(async (message) => {
      if (!message.id || !message.seenBy) return;
      if (!message.seenBy.includes(currentUser.email)) {
        const messageRef = doc(db, 'messages', message.id);
        await updateDoc(messageRef, {
          seenBy: arrayUnion(currentUser.email)
        });
      }
    });
  }, [messages, currentUser]);

  useEffect(() => {
    // Scroll to bottom when messages change and not loading
    if (!loadingMessages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loadingMessages]);

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
      console.log(error)
      return '';
    }
  };


  const handleReaction = async (messageId, emoji) => {
    const messageRef = doc(db, 'messages', messageId);
    const messageSnap = await getDoc(messageRef);
    const data = messageSnap.data();
    const currentReactions = data.reactions && data.reactions[emoji] ? data.reactions[emoji] : [];
    if (currentReactions.includes(currentUser.email)) {
  
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayRemove(currentUser.email)
      });
    } else {
    
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayUnion(currentUser.email)
      });
    }
  };

  // إرسال إيموشن كرسالة (مع emoji-mart)
  const handleEmojiSelect = (emoji) => {
    setNewMessage(newMessage + emoji.native);
    setShowEmojiPicker(false);
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
          <h3>users ({users.length})</h3>
        </div>
        <div className="users-list">
          {users.length === 0 ? (
            <div className="no-users">no users</div>
          ) : (
            users.map(user => (
              <div key={user.id} style={{gap:"10px"}} className={`user-item ${user.isOnline ? 'online' : 'offline'}`}>
                <div className="user-avatar">{user.username[0]}</div>
                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                  <span className="user-email">{user.email}</span>
                  <span   className={`user-status ${user.isOnline ? 'online' : 'offline'}` }
                    style={{fontWeight: 'bold' , gap:"5px"}}>
                    {user.isOnline ? "online" :"ofline"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <h2 style={{ color: "black", padding: "0 10px" , borderBottom:" 1px solid #e0e0e"}}>group chat</h2>
        
        </div>
        <div className="messages-container">
          {loadingMessages ? (
            <div className="messages-loader">
              <div style={{display:'flex', gap:'0.5rem', width:'600px' , justifyContent:"space-between"}}>
                <div className="loader-bubble sent" />
           
              </div>
              <div style={{display:'flex', gap:'0.5rem', width:'100%', justifyContent:'flex-start'}}>
                <div className="loader-bubble received" />
              </div>
              <div style={{display:'flex', gap:'0.5rem', width:'100%', justifyContent:'flex-start'}}>
                <div className="loader-bubble received" />
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="no-messages">لا توجد رسائل بعد</div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.senderId === currentUser.email ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <div className="message-sender-email" style={{fontWeight: 'bold', color: '#4a90e2', marginBottom: 4}}>
                      {message.senderId}
                    </div>
                    <span className="message-text">{message.message}</span>
            
                   
                    <div className="message-reactions" style={{marginTop: 6}}>
                      {['👍', '😂', '❤️', '👏'].map(emoji => (
                        <span
                          key={emoji}
                          style={{cursor: 'pointer', marginRight: 8, fontSize: 18, opacity: message.reactions[emoji]?.includes(currentUser.email) ? 1 : 0.6}}
                          onClick={() => handleReaction(message.id, emoji)}
                        >
                          {emoji} {message.reactions[emoji]?.length > 0 ? message.reactions[emoji].length : ''}
                        </span>
                      ))}
                    </div>
                    <div style={{display:"flex", justifyContent:"space-between" , width:"100%"}}>
                 
                    <div className="message-seen" style={{marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
                      <span
                        role="img"
                        aria-label="seen"
                        style={{
                          fontSize: 16,
                          color: '#b0b0b0',
                          filter: 'blur(0.2px) grayscale(0.5)',
                          verticalAlign: 'middle',
                          marginRight: 2
                        }}
                      >
                        👁️
                      </span>
                      <span style={{fontSize: 13, color: '#888'}}>{message.seenBy ? message.seenBy.length : 0}</span>
                    </div>
                    <span className="message-time">
                      {formatTime(message.createdAt)}
                    </span>
                  
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <form onSubmit={sendMessage} className="message-input" style={{position: 'relative'}}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالة..."
          />
          <button
            type="submit"
            style={{
              background: 'none',
              border: 'none',
              boxShadow: 'none',
              minWidth: 36,
              minHeight: 36,
              maxWidth: 36,
              maxHeight: 36,
              display: 'flex',
           
              justifyContent: 'center',
              padding: 0,
              marginLeft: 4,
              cursor: 'pointer',
            }}
            aria-label="إرسال"
          >
            <IoMdSend style={{fontSize: 24, color: '#4a90e2'}} />
          </button>
          <button
            type="button"
            className="emoji-picker-btn"
            style={{marginLeft: 0, fontSize: 20}}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
           
          >
           😊
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker-popup">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                locale="ar"
                Preview position="none"
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
