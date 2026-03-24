import { useNavigate } from 'react-router-dom';

export default function Profile({ role, username, onLogout }) {
  const navigate = useNavigate();

  // Mock data for the demo based on the current user
  const profileData = {
    name: username.charAt(0).toUpperCase() + username.slice(1) + ' Doe',
    gender: 'Prefer not to say',
    age: role === 'ADMIN' ? 35 : role === 'OWNER' ? 42 : 28,
    govId: 'XXXX-XXXX-1234',
    verified: true
  };

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <nav style={styles.navbar} className="glass-panel">
        <div onClick={() => navigate('/home')} style={{...styles.navBrand, cursor: 'pointer'}}>
          <div style={{...styles.logoCircle, width: '30px', height: '30px'}}>
             <span style={{color: 'white', fontWeight: 'bold'}}>R</span>
          </div>
          <span style={styles.navTitle}>RoamNest</span>
        </div>
        
        <div style={styles.navRight}>
          <button onClick={() => navigate('/home')} style={styles.backBtn}>Back to Home</button>
          <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Main Profile Layout */}
      <main style={styles.mainContent}>
        <div className="glass-panel" style={styles.profileCard}>
          
          {/* Left Side: Avatar and Status */}
          <div style={styles.leftPanel}>
            <div style={styles.avatarContainer}>
              <div style={{...styles.avatarPlaceholder, backgroundImage: 'url(https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)'}}></div>
              {profileData.verified && (
                <div style={styles.verifiedBadge}>
                  ✓ Verified
                </div>
              )}
            </div>
            
            <h2 style={styles.userName}>{profileData.name}</h2>
            <div style={styles.roleBadge}>{role}</div>
            
            <p style={styles.joinDate}>Member since 2026</p>
          </div>

          {/* Right Side: Details Grid */}
          <div style={styles.rightPanel}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Full Name</span>
                <span style={styles.detailValue}>{profileData.name}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Gender</span>
                <span style={styles.detailValue}>{profileData.gender}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Age</span>
                <span style={styles.detailValue}>{profileData.age} years old</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Government ID</span>
                <span style={styles.detailValue}>{profileData.govId}</span>
              </div>
            </div>

            <div style={styles.actions}>
              <button className="btn-primary" style={{marginRight: '12px'}}>Edit Profile</button>
              <button className="btn-primary" style={{background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', boxShadow: 'none'}}>Update ID</button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    marginBottom: '60px',
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
    gap: '16px'
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontWeight: '600',
    padding: '8px 16px',
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
  mainContent: {
    display: 'flex',
    justifyContent: 'center'
  },
  profileCard: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    padding: '0'
  },
  leftPanel: {
    flex: '0 0 30%',
    padding: '40px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRight: '1px solid var(--glass-border)'
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: '20px'
  },
  avatarPlaceholder: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: '4px solid var(--primary)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    backgroundColor: '#10b981',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  userName: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '10px 0'
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 56, 92, 0.2)',
    color: 'var(--primary)',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  joinDate: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '20px'
  },
  rightPanel: {
    flex: '1',
    padding: '40px'
  },
  sectionTitle: {
    fontSize: '22px',
    color: 'var(--text-main)',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '16px',
    marginBottom: '32px'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '40px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  detailLabel: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600'
  },
  detailValue: {
    fontSize: '16px',
    color: 'var(--text-main)',
    fontWeight: '500'
  },
  actions: {
    marginTop: '40px',
    display: 'flex',
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '32px'
  }
};
