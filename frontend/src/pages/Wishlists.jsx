import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BurgerMenu from '../components/BurgerMenu';
import api from '../api';

const PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80';
const COLLECTION_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

export default function Wishlists({ role, username, onLogout }) {
  const navigate = useNavigate();
  const [wishlists, setWishlists] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadWishlists = () => {
    setLoading(true);
    setError('');
    api.get('/wishlists')
      .then(r => setWishlists(r.data))
      .catch(() => setError('Could not load wishlists.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWishlists();
  }, []);

  const openWishlist = (wishlistId) => {
    setDetailLoading(true);
    setError('');
    api.get(`/wishlists/${wishlistId}`)
      .then(r => setSelected(r.data))
      .catch(() => setError('Could not load this wishlist.'))
      .finally(() => setDetailLoading(false));
  };

  const createWishlist = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setSaving(true);
    setError('');
    try {
      const response = await api.post('/wishlists', { name });
      setNewName('');
      setSelected(response.data);
      loadWishlists();
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

  const removeProperty = async (propertyId) => {
    if (!selected) return;
    setError('');
    try {
      await api.delete(`/wishlists/${selected.id}/properties/${propertyId}`);
      openWishlist(selected.id);
      loadWishlists();
    } catch {
      setError('Could not remove this property.');
    }
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar} className="glass-panel">
        <div onClick={() => navigate('/home')} style={{ ...styles.navBrand, cursor: 'pointer' }}>
          <div style={styles.logoCircle}><span style={{ color: 'white', fontWeight: 'bold' }}>R</span></div>
          <span style={styles.navTitle}>RoamNest</span>
        </div>
        <div style={styles.navRight}>
          <button id="user-btn" onClick={() => navigate('/profile')} style={styles.userBtn}>
            <span style={styles.avatarInitial}>{username?.[0]?.toUpperCase()}</span>
            <span>{username}</span>
          </button>
          <BurgerMenu onLogout={onLogout} />
        </div>
      </nav>

      <main style={styles.main}>
        <h1 style={styles.pageTitle}>My Wishlists</h1>
        <p style={styles.subtitle}>Your saved homes and experiences</p>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.grid}>
          {loading && <div className="glass-panel" style={styles.emptyCard}>Loading wishlists...</div>}

          {!loading && wishlists.map((wl) => (
            <div key={wl.id} className="glass-panel" style={styles.card} onClick={() => openWishlist(wl.id)}>
              <div style={{ ...styles.cardImg, backgroundImage: `url(${COLLECTION_IMAGE})` }}>
                <div style={styles.heartBadge}>♥</div>
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{wl.name}</h3>
                <p style={styles.cardCount}>{wl.propertyCount} saved {wl.propertyCount === 1 ? 'property' : 'properties'}</p>
              </div>
            </div>
          ))}

          <div className="glass-panel" style={{ ...styles.card, ...styles.newCard }}>
            <div style={styles.plusIcon}>+</div>
            <p style={styles.newLabel}>Create New Wishlist</p>
            <form onSubmit={createWishlist} style={styles.createForm}>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Summer 2026"
                maxLength={120}
                style={styles.input}
              />
              <button className="btn-primary" type="submit" disabled={saving || !newName.trim()} style={styles.createBtn}>
                {saving ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>
        </div>

        <section className="glass-panel" style={styles.detailPanel}>
          {detailLoading && <p style={styles.cardCount}>Loading saved properties...</p>}
          {!detailLoading && !selected && (
            <p style={styles.cardCount}>Select a wishlist to see its saved properties.</p>
          )}
          {!detailLoading && selected && (
            <>
              <div style={styles.detailHeader}>
                <div>
                  <h2 style={styles.detailTitle}>{selected.name}</h2>
                  <p style={styles.cardCount}>{selected.propertyCount} saved {selected.propertyCount === 1 ? 'property' : 'properties'}</p>
                </div>
              </div>

              {selected.properties.length === 0 ? (
                <p style={styles.cardCount}>No properties saved here yet. Heart one from Home or Search.</p>
              ) : (
                <div style={styles.propertyGrid}>
                  {selected.properties.map(property => (
                    <div key={property.id} style={styles.propertyCard}>
                      <div style={{ ...styles.propertyImage, backgroundImage: `url(${PROPERTY_IMAGE})` }} />
                      <div style={styles.propertyBody}>
                        <h3 style={styles.cardTitle}>{property.title}</h3>
                        <p style={styles.cardCount}>{property.location}</p>
                        <p style={styles.price}>${property.pricePerNight} <span style={styles.night}>/ night</span></p>
                        <div style={styles.propertyActions}>
                          <button
                            className="btn-primary"
                            style={styles.viewBtn}
                            onClick={() => navigate(`/properties/${property.id}`, { state: { property } })}
                          >
                            View
                          </button>
                          <button style={styles.removeBtn} onClick={() => removeProperty(property.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '48px' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoCircle: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: '20px', fontWeight: '800', color: 'var(--primary)' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', padding: '8px 14px', borderRadius: '30px', fontSize: '14px', transition: 'all 0.2s' },
  avatarInitial: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 'bold' },
  main: { paddingTop: '8px' },
  pageTitle: { fontSize: '36px', fontWeight: 800, marginBottom: '8px', background: '-webkit-linear-gradient(45deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: 'var(--text-muted)', marginBottom: '40px', fontSize: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  card: { overflow: 'hidden', border: '1px solid var(--glass-border)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' },
  cardImg: { height: '200px', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  heartBadge: { position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fb7185' },
  cardBody: { padding: '16px' },
  cardTitle: { fontSize: '17px', fontWeight: 700, margin: '0 0 6px' },
  cardCount: { fontSize: '14px', color: 'var(--text-muted)', margin: 0 },
  newCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', border: '2px dashed var(--glass-border)', cursor: 'default', transition: 'border-color 0.2s', padding: '18px' },
  plusIcon: { fontSize: '40px', color: 'var(--text-muted)', marginBottom: '12px' },
  newLabel: { color: 'var(--text-muted)', fontWeight: 600, fontSize: '15px' },
  createForm: { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '10px' },
  input: { padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)' },
  createBtn: { padding: '10px', width: '100%' },
  emptyCard: { padding: '24px', color: 'var(--text-muted)' },
  detailPanel: { marginTop: '32px', padding: '24px' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
  detailTitle: { margin: '0 0 6px', fontSize: '24px' },
  propertyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' },
  propertyCard: { border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' },
  propertyImage: { height: '150px', backgroundSize: 'cover', backgroundPosition: 'center' },
  propertyBody: { padding: '14px' },
  price: { margin: '8px 0 0', fontWeight: 800 },
  night: { color: 'var(--text-muted)', fontWeight: 400 },
  propertyActions: { display: 'flex', gap: '10px', marginTop: '12px' },
  viewBtn: { flex: 1, padding: '8px' },
  removeBtn: { flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700 },
  error: { padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', marginBottom: '18px', fontSize: '14px' },
};
