import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Wishlists from './pages/Wishlists';
import Trips from './pages/Trips';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';
import OwnerBookings from './pages/OwnerBookings';
import Properties from './pages/Properties';
import Signup from './pages/Signup';
import CreateProperty from './pages/CreateProperty';
import PropertyDetail from './pages/PropertyDetail';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);

  // Restore session on page refresh
  useEffect(() => {
    const raw = sessionStorage.getItem('rn_auth');
    if (raw) {
      try {
        const { role, username: user } = JSON.parse(raw);
        if (role && user) {
          setUserRole(role);
          setUsername(user);
        }
      } catch {
        sessionStorage.removeItem('rn_auth');
      }
    }
  }, []);

  const handleLogin = (role, user) => {
    setUserRole(role);
    setUsername(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('rn_auth');
    setUserRole(null);
    setUsername(null);
  };

  const authProps = { role: userRole, username, onLogout: handleLogout };

  const RequireRole = ({ roles, children }) => {
    if (!userRole) return <Navigate to="/" />;
    if (!roles.includes(userRole)) return <Navigate to="/home" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={userRole ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
        <Route path="/signup" element={userRole ? <Navigate to="/home" /> : <Signup onLogin={handleLogin} />} />
        <Route path="/home"    element={userRole ? <Home      {...authProps} /> : <Navigate to="/" />} />
        <Route path="/profile" element={userRole ? <Profile   {...authProps} /> : <Navigate to="/" />} />

        {/* USER-only */}
        <Route path="/wishlists" element={<RequireRole roles={['USER']}><Wishlists {...authProps} /></RequireRole>} />
        <Route path="/trips"     element={<RequireRole roles={['USER']}><Trips     {...authProps} /></RequireRole>} />
        <Route path="/messages"  element={<RequireRole roles={['USER', 'OWNER']}><Messages  {...authProps} /></RequireRole>} />

        {/* USER + OWNER: browse and filter properties */}
        <Route path="/properties" element={<RequireRole roles={['USER', 'OWNER']}><Properties {...authProps} /></RequireRole>} />
        <Route path="/properties/:propertyId" element={<RequireRole roles={['USER', 'OWNER']}><PropertyDetail {...authProps} /></RequireRole>} />

        {/* OWNER-only */}
        <Route path="/owner/bookings" element={<RequireRole roles={['OWNER']}><OwnerBookings {...authProps} /></RequireRole>} />
        <Route path="/owner/properties/new" element={<RequireRole roles={['OWNER']}><CreateProperty {...authProps} /></RequireRole>} />

        {/* ADMIN-only */}
        <Route path="/admin" element={<RequireRole roles={['ADMIN']}><AdminDashboard {...authProps} /></RequireRole>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
