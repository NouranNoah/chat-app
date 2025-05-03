// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import Cookies from 'js-cookie';
// import { jwtDecode } from 'jwt-decode';
// import socket from './socket';

// export default function ChatWindow({ selectedUser }) {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');

//   const token = Cookies.get('authToken');
//   const decoded = jwtDecode(token);
//   const senderId = decoded.userId;
//   const idUser = selectedUser ? selectedUser._id : null;

//   // إرسال رسالة
//   const sendMessage = () => {
//     if (!input.trim()) {
//       console.log('Error: Empty message');
//       return;
//     }

//     // إرسال الرسالة باستخدام socket.emit
//     socket.emit('private:send', {
//       senderId: senderId,
//       recipientId: selectedUser._id,
//       content: input,
//     }, (response) => {
//       console.log("Message sent", response); // تأكد أن الرسالة تم إرسالها
//     });

//     setInput(''); // مسح الـ input بعد إرسال الرسالة
//   };

//   // استقبال الرسائل الجديدة من السيرفر
//   useEffect(() => {
//     const handleNewMessage = (message) => {
//       if (message.senderId === selectedUser._id || message.recipientId === selectedUser._id) {
//         setMessages((prev) => [...prev, message]);
//       }
//     };

//     socket.on('private:new', handleNewMessage); // الاستماع للحدث

//     return () => {
//       socket.off('private:new', handleNewMessage); // إزالة الـ listener عند التفكيك
//     };
//   }, [selectedUser]);

//   // التأكد من الاتصال بـ socket عند الاتصال
//   useEffect(() => {
//     socket.on('connect', () => {
//       console.log('Socket connected:', socket.id); // يظهر ID الـ socket عند الاتصال
//     });

//     return () => {
//       socket.off('connect'); // إزالة الـ listener عند التفكيك
//     };
//   }, []);

//   // جلب الرسائل من السيرفر
//   const getAllMessages = async () => {
//     try {
//       const res = await axios.get(
//         `https://chat-app-api-production-7f75.up.railway.app/api/v1/chats/private/${selectedUser._id}`,
//         {
//           headers: { Authorization: token },
//         }
//       );
//       const sortedMessages = res.data.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
//       setMessages(sortedMessages); // ترتيب الرسائل حسب الوقت
//     } catch (err) {
//       console.log('Error fetching messages:', err);
//     }
//   };

//   // جلب الرسائل عند تغيير المستخدم المحدد
//   useEffect(() => {
//     if (selectedUser) {
//       getAllMessages();
//     }
//   }, [selectedUser]);

//   // التمرير التلقائي للأسفل عند وصول رسائل جديدة
//   useEffect(() => {
//     const messagesDiv = document.querySelector('.messages');
//     if (messagesDiv) {
//       messagesDiv.scrollTop = messagesDiv.scrollHeight;
//     }
//   }, [messages]);

//   return (
//     <div className="chat-window">
//       <div className="chat-header">
//         {selectedUser ? selectedUser.username : 'Choose Chat'}
//       </div>

//       <div className="messages" style={{ overflowY: 'auto', maxHeight: '100vh', padding: '10px' }}>
//         {messages.map((msg) => (
//           <div
//             key={msg._id}
//             className={`message ${msg.senderId === senderId ? 'sent' : 'received'}`}
//             style={{
//               textAlign: msg.senderId === senderId ? 'right' : 'left',
//               margin: '5px 0',
//               padding: '8px 12px',
//               background: msg.senderId === senderId ? '#d1e7dd' : '#f8d7da',
//               borderRadius: '15px',
//               maxWidth: '70%',
//             }}
//           >
//             {msg.content}
//           </div>
//         ))}
//       </div>

//       {selectedUser && (
//         <div className="input-box">
//           <input
//             type="text"
//             placeholder="Write a message..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//           />
//           <button onClick={sendMessage}>
//             Send <i className="fa-solid fa-paper-plane"></i>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import socket from './socket';

export default function ChatWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const token = Cookies.get('authToken');
  const decoded = jwtDecode(token);
  const senderId = decoded.userId;

  const sendMessage = () => {
    if (!input.trim()) {
      console.log('Error: Empty message');
      return;
    }

    console.log('Sending message...', selectedUser._id);

    // تأكد أن الـ socket متصل قبل إرسال الرسالة
    if (!socket.connected) {
      console.log('Socket not connected');
      alert('Failed to send message: Socket not connected');
      return;
    }

    socket.emit('private:send', {
      recipientId: selectedUser._id,
      content: input,
    }, (response) => {
      console.log('✅ CALLBACK REACHED:', response);

      if (response.success) {
        console.log('✅ Message added to state');
        setMessages((prev) => [
          ...prev,
          { senderId, recipientId: selectedUser._id, content: input, timestamp: new Date() },
        ]);
      } else {
        console.error('❌ Failed to send:', response.message);
      }
    });

    setInput('');
  };

  useEffect(() => {
    const handleNewMessage = (message) => {
      console.log('New message received:', message);
      setMessages((prev) => [...prev, message]);
    };

    socket.on('private:new', handleNewMessage);

    return () => {
      socket.off('private:new', handleNewMessage);
    };
  }, [selectedUser]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    return () => {
      socket.off('connect');
    };
  }, []);

  const getAllMessages = async () => {
    try {
      const res = await axios.get(
        `https://chat-app-api-production-7f75.up.railway.app/api/v1/chats/private/${selectedUser._id}`,
        {
          headers: { Authorization: token },
        }
      );
      const sortedMessages = res.data.data.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(sortedMessages);
    } catch (err) {
      console.log('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      getAllMessages();
    } else {
      console.log('Error: No selected user ID');
    }
  }, [selectedUser]);

  useEffect(() => {
    const messagesDiv = document.querySelector('.messages');
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        {selectedUser ? selectedUser.username : 'Choose Chat'}
      </div>

      <div
        className="messages"
        style={{ overflowY: 'auto', maxHeight: '100vh', padding: '10px' }}
      >
        {messages.map((msg) => (
          <div
            key={msg._id || msg.timestamp}  
            className={`message ${msg.senderId === senderId ? 'sent' : 'received'}`}
            style={{
              textAlign: msg.senderId === senderId ? 'right' : 'left',
              margin: '5px 0',
              padding: '8px 12px',
              background: msg.senderId === senderId ? '#d1e7dd' : '#f8d7da',
              borderRadius: '15px',
              maxWidth: '70%',
            }}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="input-box">
          <input
            type="text"
            placeholder="Write a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>
            Send <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      )}
    </div>
  );
}
