import { useNavigate } from 'react-router-dom';
import BurgerMenu from '../components/BurgerMenu';

const MOCK_WISHLISTS = [
  { id: 1, name: 'Beach Getaways', count: 4, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { id: 2, name: 'Mountain Retreats', count: 2, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { id: 3, name: 'City Escapes', count: 7, img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80' },
];

export default function Wishlists({ role, username, onLogout }) {
  const navigate = useNavigate();

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

        <div style={styles.grid}>
          {MOCK_WISHLISTS.map((wl) => (
            <div key={wl.id} className="glass-panel" style={styles.card}>
              <div style={{ ...styles.cardImg, backgroundImage: `url(${wl.img})` }}>
                <div style={styles.heartBadge}>♡</div>
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{wl.name}</h3>
                <p style={styles.cardCount}>{wl.count} saved {wl.count === 1 ? 'property' : 'properties'}</p>
              </div>
            </div>
          ))}

          {/* Create new wishlist card */}
          <div className="glass-panel" style={{ ...styles.card, ...styles.newCard }}>
            <div style={styles.plusIcon}>+</div>
            <p style={styles.newLabel}>Create New Wishlist</p>
          </div>
        </div>
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
  heartBadge: { position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'white' },
  cardBody: { padding: '16px' },
  cardTitle: { fontSize: '17px', fontWeight: 700, margin: '0 0 6px' },
  cardCount: { fontSize: '14px', color: 'var(--text-muted)', margin: 0 },
  newCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', border: '2px dashed var(--glass-border)', cursor: 'pointer', transition: 'border-color 0.2s' },
  plusIcon: { fontSize: '40px', color: 'var(--text-muted)', marginBottom: '12px' },
  newLabel: { color: 'var(--text-muted)', fontWeight: 600, fontSize: '15px' },
};
