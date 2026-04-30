import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const INITIAL_FORM = {
  fullName: '',
  username: '',
  password: '',
  role: 'USER',
  phoneNo: '',
  address: '',
};

export default function Signup({ onLogin }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/signup', form);
      const { token, role, username } = response.data;
      sessionStorage.setItem('rn_auth', JSON.stringify({ token, role, username }));
      onLogin(role, username);
      navigate('/home');
    } catch (err) {
      if (err.response?.status === 409) {
        setError('That username is already taken.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Signup failed. Check the backend and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div className="glass-panel" style={s.card}>
        <div style={s.header}>
          <div style={s.logo}>R</div>
          <div>
            <h1 style={s.title}>Create your RoamNest account</h1>
            <p style={s.subtitle}>Sign up as a guest or owner for the live demo.</p>
          </div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={submit} style={s.form}>
          <Field label="Full Name">
            <input className="input-field" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
          </Field>
          <Field label="Username">
            <input className="input-field" value={form.username} onChange={e => set('username', e.target.value)} required />
          </Field>
          <Field label="Password">
            <input className="input-field" type="password" value={form.password} onChange={e => set('password', e.target.value)} required minLength={3} />
          </Field>
          <Field label="Role">
            <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)} style={{ cursor: 'pointer' }}>
              <option value="USER">Guest / User</option>
              <option value="OWNER">Owner / Host</option>
            </select>
          </Field>
          <Field label="Phone Number">
            <input className="input-field" value={form.phoneNo} onChange={e => set('phoneNo', e.target.value)} placeholder="9999999999" required />
          </Field>
          <Field label="Address">
            <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} placeholder="India" required />
          </Field>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <button onClick={() => navigate('/')} style={s.linkButton}>
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={s.field}>
      <span style={s.label}>{label}</span>
      {children}
    </label>
  );
}

const s = {
  container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' },
  card: { width: '100%', maxWidth: '560px', padding: '32px' },
  header: { display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '24px' },
  logo: { width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '24px', flexShrink: 0 },
  title: { fontSize: '26px', margin: 0, fontWeight: 800 },
  subtitle: { color: 'var(--text-muted)', margin: '6px 0 0', fontSize: '14px' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' },
  error: { padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', marginBottom: '16px', fontSize: '14px' },
  linkButton: { marginTop: '18px', width: '100%', background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' },
};
