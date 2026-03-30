import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Wishlists from './pages/Wishlists';
import Trips from './pages/Trips';
import Messages from './pages/Messages';
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

  const authProps = { role: userRole, username, onLogout: handleLogout };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={userRole ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
        <Route path="/home"      element={userRole ? <Home      {...authProps} /> : <Navigate to="/" />} />
        <Route path="/profile"   element={userRole ? <Profile   {...authProps} /> : <Navigate to="/" />} />
        {/* USER-only routes */}
        <Route path="/wishlists" element={userRole === 'USER' ? <Wishlists {...authProps} /> : userRole ? <Navigate to="/home" /> : <Navigate to="/" />} />
        <Route path="/trips"     element={userRole === 'USER' ? <Trips     {...authProps} /> : userRole ? <Navigate to="/home" /> : <Navigate to="/" />} />
        <Route path="/messages"  element={userRole === 'USER' ? <Messages  {...authProps} /> : userRole ? <Navigate to="/home" /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
