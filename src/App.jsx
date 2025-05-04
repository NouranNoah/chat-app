import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import Chat from './Components/Chat';

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={ <Login /> } />
      <Route path="/signup" element={<Signup /> } />
      <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} />} />
    </Routes>
  );
}

export default App;
