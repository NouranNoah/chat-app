import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const token = Cookies.get('authToken');

const socket = io('wss://chat-app-api-production-7f75.up.railway.app', {
  auth: {
    token: token 
  }
});

// إضافة مستمعات للاتصال
socket.on('connect', () => {
  console.log('Connected to server with socket ID:', socket.id);
});

socket.on('connect_error', (err) => {
  console.log('Connection error:', err);
});

export default socket;

