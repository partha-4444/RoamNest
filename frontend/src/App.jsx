import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { useState } from 'react';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);

  const handleLogin = (role, user) => {
    setUserRole(role);
    setUsername(user);
  };

  const handleLogout = () => {
    setUserRole(null);
    setUsername(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={userRole ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
        <Route path="/home" element={userRole ? <Home role={userRole} username={username} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/profile" element={userRole ? <Profile role={userRole} username={username} onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
