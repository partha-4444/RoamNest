import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BurgerMenu from '../components/BurgerMenu';

const TRIPS = {
  ongoing: [
    { id: 1, property: 'Sunset Villa, Goa', host: 'Priya S.', dates: 'Mar 28 – Apr 2, 2026', nights: 5, price: '$640', img: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80', status: 'Ongoing' },
  ],
  future: [
    { id: 2, property: 'Lakeside Cabin, Coorg', host: 'Rahul M.', dates: 'Apr 15 – Apr 18, 2026', nights: 3, price: '$210', img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80', status: 'Upcoming' },
    { id: 3, property: 'Modern Retreat, NYC', host: 'Alex T.', dates: 'May 5 – May 10, 2026', nights: 5, price: '$600', img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80', status: 'Upcoming' },
  ],
  past: [
    { id: 4, property: 'Heritage Haveli, Jaipur', host: 'Mohit A.', dates: 'Jan 10 – Jan 14, 2026', nights: 4, price: '$320', img: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80', status: 'Completed' },
    { id: 5, property: 'Beachfront Bungalow, Bali', host: 'Made W.', dates: 'Dec 20 – Dec 27, 2025', nights: 7, price: '$490', img: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80', status: 'Completed' },
  ],
};

const TAB_LABELS = [
  { key: 'ongoing', label: 'Ongoing 🟢' },
  { key: 'future', label: 'Upcoming 📅' },
  { key: 'past', label: 'Past ✓' },
];

const STATUS_COLORS = {
  Ongoing: '#10b981',
  Upcoming: '#38bdf8',
  Completed: '#94a3b8',
};

export default function Trips({ role, username, onLogout }) {
  const [tab, setTab] = useState('ongoing');
  const navigate = useNavigate();
  const trips = TRIPS[tab];

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
        <h1 style={styles.pageTitle}>My Trips</h1>
        <p style={styles.subtitle}>Your journey, all in one place</p>

        {/* Tabs */}
        <div style={styles.tabRow}>
          {TAB_LABELS.map((t) => (
            <button
              key={t.key}
              id={`tab-${t.key}`}
              onClick={() => setTab(t.key)}
              style={{
                ...styles.tabBtn,
                background: tab === t.key ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: tab === t.key ? 'white' : 'var(--text-muted)',
                border: tab === t.key ? 'none' : '1px solid var(--glass-border)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        {trips.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🧳</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>No {tab} trips yet. Start exploring!</p>
            <button onClick={() => navigate('/home')} className="btn-primary" style={{ marginTop: '20px' }}>Explore Stays</button>
          </div>
        ) : (
          <div style={styles.list}>
            {trips.map((trip) => (
              <div key={trip.id} className="glass-panel" style={styles.card}>
                <div style={{ ...styles.cardImg, backgroundImage: `url(${trip.img})` }}>
                  <span style={{ ...styles.statusBadge, background: STATUS_COLORS[trip.status] }}>{trip.status}</span>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{trip.property}</h3>
                    <span style={styles.price}>{trip.price}</span>
                  </div>
                  <p style={styles.detail}>Hosted by {trip.host}</p>
                  <p style={styles.detail}>📅 {trip.dates} · {trip.nights} nights</p>
                  <div style={styles.actions}>
                    <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>View Details</button>
                    {trip.status === 'Completed' && (
                      <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', boxShadow: 'none', marginLeft: '10px' }}>
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '48px' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoCircle: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: '20px', fontWeight: '800', color: 'var(--primary)' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', padding: '8px 14px', borderRadius: '30px', fontSize: '14px', transition: 'all 0.2s' },
  avatarInitial: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 'bold' },
  main: { paddingTop: '8px' },
  pageTitle: { fontSize: '36px', fontWeight: 800, marginBottom: '8px', background: '-webkit-linear-gradient(45deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: 'var(--text-muted)', marginBottom: '32px', fontSize: '16px' },
  tabRow: { display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' },
  tabBtn: { padding: '10px 22px', borderRadius: '30px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' },
  list: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { display: 'flex', overflow: 'hidden', border: '1px solid var(--glass-border)', transition: 'transform 0.2s' },
  cardImg: { width: '220px', flexShrink: 0, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  statusBadge: { position: 'absolute', top: '12px', left: '12px', color: 'white', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px' },
  cardBody: { flex: 1, padding: '24px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  cardTitle: { fontSize: '18px', fontWeight: 700, margin: 0 },
  price: { fontSize: '18px', fontWeight: 700, color: 'var(--primary)' },
  detail: { fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0' },
  actions: { marginTop: '20px' },
  empty: { textAlign: 'center', padding: '80px 0' },
};
