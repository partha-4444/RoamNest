import { useEffect, useState } from 'react';
import api from '../api';

export default function SaveToWishlistModal({ open, property, onClose, onSaved }) {
  const [wishlists, setWishlists] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    api.get('/wishlists')
      .then(r => setWishlists(r.data))
      .catch(() => setError('Could not load wishlists.'))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open || !property) return null;

  const addToWishlist = async (wishlistId) => {
    setSaving(true);
    setError('');
    try {
      await api.post(`/wishlists/${wishlistId}/properties/${property.id}`);
      onSaved?.(property.id);
      onClose();
    } catch {
      setError('Could not save this property.');
    } finally {
      setSaving(false);
    }
  };

  const createAndAdd = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setSaving(true);
    setError('');
    try {
      const created = await api.post('/wishlists', { name });
      await api.post(`/wishlists/${created.data.id}/properties/${property.id}`);
      onSaved?.(property.id);
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('A wishlist with that name already exists.');
      } else {
        setError('Could not create wishlist.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div className="glass-panel" style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Save to wishlist</h2>
            <p style={s.subtitle}>{property.title}</p>
          </div>
          <button style={s.closeBtn} onClick={onClose}>×</button>
        </div>

        {error && <div style={s.error}>{error}</div>}
        {loading && <p style={s.muted}>Loading wishlists...</p>}

        {!loading && wishlists.length > 0 && (
          <div style={s.list}>
            {wishlists.map(wishlist => (
              <button
                key={wishlist.id}
                type="button"
                style={s.wishlistBtn}
                disabled={saving}
                onClick={() => addToWishlist(wishlist.id)}
              >
                <span>{wishlist.name}</span>
                <span style={s.count}>{wishlist.propertyCount} saved</span>
              </button>
            ))}
          </div>
        )}

        {!loading && wishlists.length === 0 && (
          <p style={s.muted}>Create your first wishlist to save this stay.</p>
        )}

        <form onSubmit={createAndAdd} style={s.form}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New wishlist name"
            maxLength={120}
            style={s.input}
          />
          <button className="btn-primary" type="submit" disabled={saving || !newName.trim()} style={s.createBtn}>
            {saving ? 'Saving...' : 'Create & Save'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' },
  modal: { width: '100%', maxWidth: '440px', padding: '22px', border: '1px solid var(--glass-border)' },
  header: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '18px' },
  title: { margin: 0, fontSize: '24px', fontWeight: 800 },
  subtitle: { margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '14px' },
  closeBtn: { border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)', borderRadius: '10px', width: '34px', height: '34px', cursor: 'pointer', fontSize: '20px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' },
  wishlistBtn: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700 },
  count: { color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '18px' },
  input: { padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)' },
  createBtn: { padding: '10px' },
  muted: { color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 },
  error: { padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', marginBottom: '14px', fontSize: '14px' },
};
