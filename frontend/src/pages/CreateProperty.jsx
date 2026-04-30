import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const INITIAL_FORM = {
  title: '',
  description: '',
  location: '',
  address: '',
  pricePerNight: '',
  maxGuests: '',
  available: true,
};

export default function CreateProperty({ username, onLogout }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        pricePerNight: Number(form.pricePerNight),
        maxGuests: Number(form.maxGuests),
      };
      const response = await api.post('/properties', payload);
      setMessage('Property created successfully. Redirecting to listing details...');
      setTimeout(() => navigate(`/properties/${response.data.id}`, { state: { property: response.data } }), 500);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Could not create property. Please check the details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <nav style={s.nav} className="glass-panel">
        <span style={s.brand} onClick={() => navigate('/home')}>RoamNest</span>
        <div style={s.navRight}>
          <span style={s.username}>{username}</span>
          <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div className="glass-panel" style={s.card}>
        <div style={s.header}>
          <p style={s.kicker}>Owner Tools</p>
          <h1 style={s.title}>Create a New Listing</h1>
          <p style={s.subtitle}>Add the key stay details guests need before sending a booking request.</p>
        </div>

        {message && <div style={s.success}>{message}</div>}
        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={submit} style={s.form}>
          <Field label="Title">
            <input className="input-field" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Lake House" required />
          </Field>
          <Field label="Location">
            <input className="input-field" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Pokhara" required />
          </Field>
          <Field label="Address">
            <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Lakeside Road" />
          </Field>
          <Field label="Price Per Night">
            <input className="input-field" type="number" min="1" step="0.01" value={form.pricePerNight} onChange={e => set('pricePerNight', e.target.value)} required />
          </Field>
          <Field label="Max Guests">
            <input className="input-field" type="number" min="1" value={form.maxGuests} onChange={e => set('maxGuests', e.target.value)} required />
          </Field>
          <label style={s.checkboxRow}>
            <input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)} />
            Available for booking
          </label>
          <label style={{ ...s.field, gridColumn: '1 / -1' }}>
            <span style={s.label}>Description</span>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Peaceful lake-facing home"
              rows={5}
              style={s.textarea}
            />
          </label>

          <div style={s.actions}>
            <button type="button" onClick={() => navigate('/home')} style={s.secondaryBtn}>Cancel</button>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
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
  page: { padding: '24px', maxWidth: '980px', margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '32px' },
  brand: { fontWeight: 800, color: 'var(--primary)', cursor: 'pointer', fontSize: '18px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  username: { color: 'var(--text-muted)', fontSize: '14px' },
  logoutBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 },
  card: { padding: '30px' },
  header: { marginBottom: '24px' },
  kicker: { color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '12px', fontWeight: 800, marginBottom: '8px' },
  title: { fontSize: '34px', fontWeight: 800, margin: 0 },
  subtitle: { color: 'var(--text-muted)', marginTop: '8px' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' },
  textarea: { padding: '14px 16px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-main)', font: 'inherit', resize: 'vertical', outline: 'none' },
  checkboxRow: { display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-muted)', paddingTop: '30px' },
  actions: { gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  secondaryBtn: { background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 },
  success: { padding: '12px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '10px', color: '#4ade80', marginBottom: '16px' },
  error: { padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', marginBottom: '16px' },
};
