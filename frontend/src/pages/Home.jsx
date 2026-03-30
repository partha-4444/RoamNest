import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BurgerMenu from '../components/BurgerMenu';

export default function Home({ role, username, onLogout }) {
  const [activeTab, setActiveTab] = useState('explore');
  const navigate = useNavigate();

  // RBAC rendering helpers
  const isAdmin = role === 'ADMIN';
  const isOwner = role === 'OWNER';
  const isUser  = role === 'USER';
  
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
        
        <div style={styles.navCenter}>
          <span style={styles.searchPill}>
            <span>Anywhere</span> <span style={styles.pillDivider}></span>
            <span>Any week</span> <span style={styles.pillDivider}></span>
            <span style={{color: 'var(--text-muted)'}}>Add guests</span>
            <div style={styles.searchIcon}>
               <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{display: 'block', fill: 'none', height: '12px', width: '12px', stroke: 'currentcolor', strokeWidth: '5.33333', overflow: 'visible'}}><g fill="none"><path d="m13 24c6.0751322 0 11-4.9248678 11-11 0-6.07513225-4.9248678-11-11-11-6.07513225 0-11 4.92486775-11 11 0 6.0751322 4.92486775 11 11 11zm8-3 9 9"></path></g></svg>
            </div>
          </span>
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
        
        {/* User View (Everyone sees properties) */}
        <section>
          <div style={styles.sectionHeader}>
            <h2>Featured Stays</h2>
          </div>
          <div style={styles.propertyGrid}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="glass-panel" style={styles.propertyCard}>
                <div style={{...styles.propertyImage, backgroundImage: `url(https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)`}}></div>
                <div style={styles.propertyInfo}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <h3 style={{fontSize: '16px', margin: 0}}>Modern Retreat, NY</h3>
                    <span>★ 4.9</span>
                  </div>
                  <p style={{color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0'}}>2,300 kilometers away</p>
                  <p style={{margin: '8px 0 0', fontWeight: 'bold'}}>$120 <span style={{fontWeight: 'normal', color: 'var(--text-muted)'}}>night</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Owner View Components */}
        {isOwner && (
          <section style={styles.rbacSection}>
            <h2 style={{color: '#fcd34d'}}>Owner Dashboard</h2>
            <div className="glass-panel" style={styles.actionPanel}>
              <div style={styles.actionItem}>
                <h3>+ Add New Property</h3>
                <p>List a new home for guests.</p>
                <button className="btn-primary" style={{marginTop:'10px'}}>Create Listing</button>
              </div>
              <div style={styles.actionItem}>
                <h3>Pending Bookings</h3>
                <p>You have 3 requests waiting.</p>
                <button className="btn-primary" style={{marginTop:'10px', background: 'transparent', border:'1px solid var(--primary)', color:'var(--primary)'}}>View Requests</button>
              </div>
            </div>
          </section>
        )}

        {/* Admin View Components */}
        {isAdmin && (
          <section style={styles.rbacSection}>
            <h2 style={{color: '#38bdf8'}}>Platform Administration</h2>
            <div className="glass-panel" style={{...styles.actionPanel, gridTemplateColumns: 'repeat(3, 1fr)'}}>
              <div style={styles.actionItem}>
                <h3>User Management</h3>
                <p>1,240 active users</p>
              </div>
              <div style={styles.actionItem}>
                <h3>Review Listings</h3>
                <p>12 listings pending approval</p>
              </div>
              <div style={styles.actionItem}>
                <h3>System Status</h3>
                <p>All services operational ✓</p>
              </div>
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
  navCenter: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  searchPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '8px 8px 8px 24px',
    border: '1px solid var(--glass-border)',
    borderRadius: '40px',
    background: 'rgba(15, 23, 42, 0.4)',
    fontSize: '14px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s'
  },
  pillDivider: {
    height: '24px',
    width: '1px',
    backgroundColor: 'var(--glass-border)'
  },
  searchIcon: {
    background: 'var(--primary)',
    color: 'white',
    padding: '10px',
    borderRadius: '50%'
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
