import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const encodePasswordForLogin = (value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return `base64:${btoa(binary)}`;
};

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password: encodePasswordForLogin(password),
      });
      const { token, role, username: user } = response.data;
      sessionStorage.setItem('rn_auth', JSON.stringify({ token, role, username: user }));
      onLogin(role, user);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Server error. Ensure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoCircle}>
            <span style={styles.logoText}>R</span>
          </div>
          <h1 style={styles.title}>RoamNest</h1>
        </div>
        
        <p style={styles.subtitle}>Welcome back! Please login to your account.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. admin, owner, user"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="(same as username for demo)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '10px'}} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div style={styles.demoInfo}>
          Demo Accounts: <br />
          <b>admin / admin</b> | <b>owner / owner</b> | <b>user / user</b>
        </div>
        <button onClick={() => navigate('/signup')} style={styles.signupLink}>
          New to RoamNest? Create an account
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  logoCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), #fb7185)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    background: '-webkit-linear-gradient(45deg, var(--text-main), var(--text-muted))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    marginBottom: '32px',
    textAlign: 'center'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  errorBox: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  demoInfo: {
    marginTop: '30px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: '1.6'
  },
  signupLink: {
    marginTop: '16px',
    background: 'transparent',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: 700,
    cursor: 'pointer'
  }
};
