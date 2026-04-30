import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BurgerMenu from '../components/BurgerMenu';
import api from '../api';

export default function Home({ role, username, onLogout }) {
  const [properties, setProperties] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const navigate = useNavigate();

  const isAdmin = role === 'ADMIN';
  const isOwner = role === 'OWNER';
  const isUser  = role === 'USER';

  useEffect(() => {
    if (isUser || isOwner) {
      api.get('/properties').then(r => setProperties(r.data)).catch(() => {});
    }
    if (isAdmin) {
      api.get('/admin/summary').then(r => setSummary(r.data)).catch(() => {});
    }
    if (isOwner) {
      api.get('/bookings/owner', { params: { status: 'PENDING' } })
        .then(r => setPendingCount(r.data.length))
        .catch(() => {});
    }
  }, [role]);

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <nav style={styles.navbar} className="glass-panel">
        <div style={styles.navBrand}>
          <div style={{...styles.logoCircle, width: '30px', height: '30px'}}>
             <span style={{color: 'white', fontWeight: 'bold'}}>R</span>
          </div>
          <span style={styles.navTitle}>RoamNest</span>
        </div>
        <div style={styles.navRight}>
          {isUser ? (
            // USER: pill button → profile + burger menu with full nav
            <>
              <button id="user-btn" onClick={() => navigate('/profile')} style={styles.userBtn}>
                <span style={styles.avatarInitial}>{username?.[0]?.toUpperCase()}</span>
                <span>{username}</span>
              </button>
              <BurgerMenu onLogout={onLogout} />
            </>
          ) : (
            // ADMIN / OWNER: simple original buttons
            <>
              <div style={styles.userInfo}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{username}</span>
              </div>
              <button onClick={() => navigate('/profile')} style={styles.profileBtn}>Profile</button>
              <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Header specific to Role */}
      <header style={styles.hero}>
        <h1 style={styles.heroTitle}>
          {isAdmin ? "Admin Control Center" : isOwner ? "Manage Your Properties" : "Find Your Next Adventure"}
        </h1>
        <p style={styles.heroSubtitle}>
          {isAdmin ? "Manage users, monitor transactions, and oversee the entire RoamNest platform." 
          : isOwner ? "List your homes, manage bookings, and grow your earnings." 
          : "Discover unique homes and experiences around the world."}
        </p>
      </header>

      {/* Dynamic Content based on RBAC */}
      <main style={styles.mainContent}>
        
        {/* USER / OWNER: Available Properties */}
        {(isUser || isOwner) && (
          <section>
            <div style={{...styles.sectionHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h2>Available Stays</h2>
              <button
                onClick={() => navigate('/properties')}
                style={{background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600}}
              >
                Search &amp; Filter
              </button>
            </div>
            {properties.length === 0 ? (
              <p style={{color: 'var(--text-muted)'}}>No available properties right now.</p>
            ) : (
              <div style={styles.propertyGrid}>
                {properties.slice(0, 8).map(p => (
                  <div
                    key={p.id}
                    className="glass-panel"
                    style={styles.propertyCard}
                    onClick={() => navigate(`/properties/${p.id}`, { state: { property: p } })}
                  >
                    <div style={{...styles.propertyImage, backgroundImage: `url(https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80)`}} />
                    <div style={styles.propertyInfo}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h3 style={{fontSize: '15px', margin: 0}}>{p.title}</h3>
                        {p.reviewSummary?.reviewCount > 0 && (
                          <span style={{fontSize: '13px'}}>★ {p.reviewSummary.averageRating.toFixed(1)}</span>
                        )}
                      </div>
                      <p style={{color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0'}}>{p.location}</p>
                      <p style={{margin: '6px 0 0', fontWeight: 'bold'}}>${p.pricePerNight} <span style={{fontWeight: 'normal', color: 'var(--text-muted)'}}>/ night</span></p>
                      <p style={{fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0'}}>Up to {p.maxGuests} guests</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* OWNER Dashboard */}
        {isOwner && (
          <section style={styles.rbacSection}>
            <h2 style={{color: '#fcd34d'}}>Owner Dashboard</h2>
            <div className="glass-panel" style={styles.actionPanel}>
              <div style={styles.actionItem}>
                <h3>+ Add New Property</h3>
                <p>List a new home for guests to discover.</p>
                <button className="btn-primary" style={{marginTop: '10px'}} onClick={() => navigate('/owner/properties/new')}>
                  Create Listing
                </button>
              </div>
              <div style={styles.actionItem}>
                <h3>Booking Requests</h3>
                <p>
                  {pendingCount === null
                    ? 'Loading...'
                    : pendingCount > 0
                      ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''} awaiting your decision.`
                      : 'No pending requests right now.'}
                </p>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/owner/bookings')}
                  style={{marginTop: '10px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)'}}
                >
                  View Requests
                </button>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/messages')}
                  style={{marginTop: '10px', marginLeft: '10px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', boxShadow: 'none'}}
                >
                  Messages
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ADMIN Dashboard */}
        {isAdmin && (
          <section style={styles.rbacSection}>
            <h2 style={{color: '#38bdf8'}}>Platform Administration</h2>
            <div className="glass-panel" style={{...styles.actionPanel, gridTemplateColumns: 'repeat(3, 1fr)'}}>
              <div style={styles.actionItem}>
                <h3>Users</h3>
                {summary
                  ? <><p style={{fontSize: '24px', fontWeight: 700, margin: '8px 0'}}>{summary.adminCount + summary.ownerCount + summary.userCount}</p><p style={{color: 'var(--text-muted)', fontSize: '13px'}}>{summary.ownerCount} owners · {summary.userCount} guests</p></>
                  : <p style={{color: 'var(--text-muted)'}}>Loading…</p>}
              </div>
              <div style={styles.actionItem}>
                <h3>Properties</h3>
                {summary
                  ? <><p style={{fontSize: '24px', fontWeight: 700, margin: '8px 0'}}>{summary.totalProperties}</p><p style={{color: 'var(--text-muted)', fontSize: '13px'}}>{summary.availableProperties} available</p></>
                  : <p style={{color: 'var(--text-muted)'}}>Loading…</p>}
              </div>
              <div style={styles.actionItem}>
                <h3>Bookings</h3>
                {summary
                  ? <><p style={{fontSize: '24px', fontWeight: 700, margin: '8px 0'}}>{summary.pendingBookings + summary.approvedBookings + summary.rejectedBookings}</p><p style={{color: 'var(--text-muted)', fontSize: '13px'}}>{summary.pendingBookings} pending · ★ {summary.overallAverageRating.toFixed(1)} avg</p></>
                  : <p style={{color: 'var(--text-muted)'}}>Loading…</p>}
              </div>
            </div>
            <div style={{marginTop: '16px', display: 'flex', gap: '12px'}}>
              <button className="btn-primary" onClick={() => navigate('/admin')} style={{padding: '8px 20px'}}>
                Full Admin Dashboard →
              </button>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    marginBottom: '40px',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoCircle: {
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), #fb7185)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  navTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--primary)',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontWeight: '600',
    padding: '8px 14px',
    borderRadius: '30px',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  avatarInitial: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), #fb7185)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  // ADMIN / OWNER nav styles (not shown to USER)
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  profileBtn: {
    background: 'transparent',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontWeight: '600',
    padding: '6px 16px',
    borderRadius: '8px',
    transition: 'background 0.2s',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'color 0.2s',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '60px',
    marginTop: '40px'
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: 800,
    marginBottom: '16px',
    background: '-webkit-linear-gradient(45deg, #fff, #94a3b8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: 'var(--text-muted)',
    maxWidth: '600px',
    margin: '0 auto'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '50px'
  },
  sectionHeader: {
    marginBottom: '24px'
  },
  propertyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px'
  },
  propertyCard: {
    overflow: 'hidden',
    border: '1px solid var(--glass-border)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  propertyImage: {
    height: '240px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  propertyInfo: {
    padding: '16px'
  },
  rbacSection: {
    marginTop: '20px',
    paddingTop: '40px',
    borderTop: '1px solid var(--glass-border)'
  },
  actionPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    padding: '24px',
    marginTop: '20px'
  },
  actionItem: {
    padding: '20px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
  }
};
