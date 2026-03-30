import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BurgerMenu from '../components/BurgerMenu';

/* ─── Mock Data ─────────────────────────────────────────────────────── */
const PAST_TRIPS = [
  { id: 1, property: 'Heritage Haveli, Jaipur', host: 'Mohit A.', dates: 'Jan 10 – Jan 14, 2026', nights: 4, price: '$320', img: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80' },
  { id: 2, property: 'Beachfront Bungalow, Bali', host: 'Made W.', dates: 'Dec 20 – Dec 27, 2025', nights: 7, price: '$490', img: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80' },
  { id: 3, property: 'Hillside Cabin, Coorg', host: 'Rahul M.', dates: 'Nov 1 – Nov 4, 2025', nights: 3, price: '$180', img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80' },
];

const MOCK_REVIEWS = [
  { id: 1, property: 'Heritage Haveli, Jaipur', date: 'January 2026', rating: 5, text: 'Absolutely stunning property. The heritage architecture was breathtaking and the host was incredibly welcoming. Would visit again in a heartbeat!' },
  { id: 2, property: 'Beachfront Bungalow, Bali', date: 'December 2025', rating: 4, text: 'Perfect beachside escape. The sunrise views were unreal. Only minor issue was the WiFi, but honestly you won\'t want to be on your phone anyway.' },
];

const ALL_INTERESTS = [
  'Hiking', 'Photography', 'Cooking', 'Reading', 'Travel', 'Music',
  'Yoga', 'Swimming', 'Cycling', 'Architecture', 'Art', 'Coffee',
];

/* ─── Stars Component ────────────────────────────────────────────────── */
function Stars({ rating }) {
  return (
    <span style={{ color: '#ff385c', fontSize: '14px', letterSpacing: '1px' }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

/* ─── ID Verification Modal ──────────────────────────────────────────── */
function IdModal({ verified, onClose }) {
  return (
    <div style={M.overlay} onClick={onClose}>
      <div style={M.modal} onClick={e => e.stopPropagation()}>
        <button style={M.closeBtn} onClick={onClose}>✕</button>

        {verified ? (
          <>
            <div style={M.verifiedIcon}>✓</div>
            <h2 style={M.modalTitle}>Identity Verified</h2>
            <p style={M.modalSub}>
              Your government ID has been successfully verified. Your profile shows a verified badge to hosts.
            </p>
            <div style={M.idCard}>
              <div style={M.idRow}>
                <span style={M.idLabel}>Document Type</span>
                <span style={M.idVal}>National ID / Passport</span>
              </div>
              <div style={M.idRow}>
                <span style={M.idLabel}>Document Number</span>
                <span style={M.idVal}>XXXX-XXXX-1234</span>
              </div>
              <div style={M.idRow}>
                <span style={M.idLabel}>Verified On</span>
                <span style={M.idVal}>March 2026</span>
              </div>
              <div style={{ ...M.idRow, border: 'none' }}>
                <span style={M.idLabel}>Status</span>
                <span style={{ ...M.idVal, color: '#10b981', fontWeight: 700 }}>✓ Active</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ ...M.verifiedIcon, background: 'rgba(255,56,92,0.12)', color: 'var(--primary)' }}>🪪</div>
            <h2 style={M.modalTitle}>Verify Your Identity</h2>
            <p style={M.modalSub}>
              Add a government-issued ID to build trust with hosts and unlock all booking features.
            </p>
            <div style={M.stepList}>
              {['Upload a valid government-issued photo ID', 'Take a selfie to match your document', 'Wait for automated verification (usually instant)'].map((s, i) => (
                <div key={i} style={M.step}>
                  <div style={M.stepNum}>{i + 1}</div>
                  <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>{s}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Start Verification →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Profile Component ─────────────────────────────────────────── */
export default function Profile({ role, username, onLogout }) {
  const navigate = useNavigate();
  const isUser = role === 'USER';

  const [activeTab, setActiveTab]       = useState('about');
  const [showIdModal, setShowIdModal]   = useState(false);
  const [interests, setInterests]       = useState(['Hiking', 'Photography', 'Travel', 'Coffee']);
  const [showInterestPicker, setShowInterestPicker] = useState(false);

  const profileData = {
    name:     username.charAt(0).toUpperCase() + username.slice(1) + ' Doe',
    bio:      "Passionate explorer and part-time photographer. I love discovering hidden gems in every city I visit. Dog dad 🐶 | Coffee addict ☕ | Always planning the next adventure.",
    address:  '412, Palm Grove Avenue, Mumbai, MH 400001',
    languages: ['English', 'Hindi', 'Spanish'],
    verified: true,
    age:      role === 'ADMIN' ? 35 : role === 'OWNER' ? 42 : 28,
  };

  const toggleInterest = (interest) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  return (
    <div style={S.page}>
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={S.navbar} className="glass-panel">
        <div onClick={() => navigate('/home')} style={{ ...S.navBrand, cursor: 'pointer' }}>
          <div style={{ ...S.logoCircle, width: '30px', height: '30px' }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>R</span>
          </div>
          <span style={S.navTitle}>RoamNest</span>
        </div>
        <div style={S.navRight}>
          {isUser ? (
            <>
              <button id="user-btn" onClick={() => navigate('/profile')} style={S.userBtn}>
                <span style={S.avatarInitial}>{username?.[0]?.toUpperCase()}</span>
                <span>{username}</span>
              </button>
              <BurgerMenu onLogout={onLogout} />
            </>
          ) : (
            <>
              <button onClick={() => navigate('/home')} style={S.backBtn}>Back to Home</button>
              <button onClick={onLogout} style={S.logoutBtn}>Logout</button>
            </>
          )}
        </div>
      </nav>

      {/* ── Layout ─────────────────────────────────────────────────── */}
      <div style={S.layout}>

        {/* ── Left Sidebar ─────────────────────────────────────────── */}
        <aside style={S.sidebar}>
          <div className="glass-panel" style={S.sideCard}>
            {/* Avatar */}
            <div style={S.avatarWrap}>
              <div style={{
                ...S.avatar,
                backgroundImage: 'url(https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)',
              }} />
              {profileData.verified && (
                <div style={S.verifiedBadge}>✓ Verified</div>
              )}
            </div>

            <h2 style={S.sidebarName}>{profileData.name}</h2>
            <div style={S.rolePill}>{role}</div>
            <p style={S.memberSince}>Member since 2026</p>

            <div style={S.sideStats}>
              <div style={S.statItem}>
                <span style={S.statNum}>{PAST_TRIPS.length}</span>
                <span style={S.statLabel}>Trips</span>
              </div>
              <div style={S.statDivider}/>
              <div style={S.statItem}>
                <span style={S.statNum}>{MOCK_REVIEWS.length}</span>
                <span style={S.statLabel}>Reviews</span>
              </div>
              <div style={S.statDivider}/>
              <div style={S.statItem}>
                <span style={S.statNum}>4.9</span>
                <span style={S.statLabel}>Rating</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Right Content ─────────────────────────────────────────── */}
        <div style={S.content}>
          {/* Tabs */}
          <div style={S.tabBar}>
            {[{ key: 'about', label: 'About Me' }, { key: 'trips', label: 'Past Trips' }].map(t => (
              <button
                key={t.key}
                id={`tab-${t.key}`}
                onClick={() => setActiveTab(t.key)}
                style={{
                  ...S.tabBtn,
                  color: activeTab === t.key ? 'var(--text-main)' : 'var(--text-muted)',
                  borderBottom: activeTab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── ABOUT ME TAB ─────────────────────────────────────── */}
          {activeTab === 'about' && (
            <div style={S.tabContent}>

              {/* Name */}
              <section style={S.section}>
                <h1 style={S.profileName}>{profileData.name}</h1>
                <p style={S.profileAge}>{profileData.age} years old · {role}</p>
              </section>

              {/* Address Card (clickable → ID modal) */}
              <section style={S.section}>
                <h3 style={S.sectionHead}>Address & Identity</h3>
                <button
                  id="address-card-btn"
                  style={S.addressCard}
                  onClick={() => setShowIdModal(true)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <span style={S.addrIcon}>📍</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <p style={S.addrLabel}>Home Address</p>
                      <p style={S.addrValue}>{profileData.address}</p>
                    </div>
                    {profileData.verified ? (
                      <span style={S.verifiedChip}>✓ ID Verified</span>
                    ) : (
                      <span style={S.unverifiedChip}>Verify ID →</span>
                    )}
                  </div>
                </button>
              </section>

              {/* Bio */}
              <section style={S.section}>
                <h3 style={S.sectionHead}>Bio</h3>
                <div className="glass-panel" style={S.bioCard}>
                  <p style={S.bioText}>{profileData.bio}</p>
                  <button style={S.editLink}>Edit Bio ✏</button>
                </div>
              </section>

              {/* Languages */}
              <section style={S.section}>
                <h3 style={S.sectionHead}>Languages I Speak</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
                  {profileData.languages.map(lang => (
                    <span key={lang} style={S.langChip}>
                      🗣 {lang}
                    </span>
                  ))}
                  <button style={S.addChipBtn}>+ Add</button>
                </div>
              </section>

              {/* Interests */}
              <section style={S.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ ...S.sectionHead, margin: 0 }}>My Interests</h3>
                  <button style={S.editLink} onClick={() => setShowInterestPicker(p => !p)}>
                    {showInterestPicker ? 'Done ✓' : '+ Add Interests'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {interests.map(i => (
                    <span key={i} style={S.interestChip}>
                      {i}
                      {showInterestPicker && (
                        <button style={S.removeTag} onClick={() => toggleInterest(i)}>✕</button>
                      )}
                    </span>
                  ))}
                </div>

                {showInterestPicker && (
                  <div className="glass-panel" style={S.interestPicker}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Tap to add or remove interests
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {ALL_INTERESTS.filter(i => !interests.includes(i)).map(i => (
                        <button key={i} style={S.pickerChip} onClick={() => toggleInterest(i)}>
                          + {i}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Reviews Written */}
              <section style={S.section}>
                <h3 style={S.sectionHead}>Reviews I've Written</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', marginTop: '-8px' }}>
                  {MOCK_REVIEWS.length} review{MOCK_REVIEWS.length !== 1 ? 's' : ''} written
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {MOCK_REVIEWS.map(rev => (
                    <div key={rev.id} className="glass-panel" style={S.reviewCard}>
                      <div style={S.reviewHeader}>
                        <div>
                          <p style={S.reviewProperty}>{rev.property}</p>
                          <p style={S.reviewDate}>{rev.date}</p>
                        </div>
                        <Stars rating={rev.rating} />
                      </div>
                      <p style={S.reviewText}>"{rev.text}"</p>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          )}

          {/* ── PAST TRIPS TAB ───────────────────────────────────── */}
          {activeTab === 'trips' && (
            <div style={S.tabContent}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
                All your completed journeys with RoamNest
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {PAST_TRIPS.map(trip => (
                  <div key={trip.id} className="glass-panel" style={S.tripCard}>
                    <div style={{ ...S.tripImg, backgroundImage: `url(${trip.img})` }}>
                      <span style={S.completedBadge}>✓ Completed</span>
                    </div>
                    <div style={S.tripBody}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={S.tripTitle}>{trip.property}</h3>
                        <span style={S.tripPrice}>{trip.price}</span>
                      </div>
                      <p style={S.tripDetail}>Hosted by {trip.host}</p>
                      <p style={S.tripDetail}>📅 {trip.dates} · {trip.nights} nights</p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>View Details</button>
                        <button
                          className="btn-primary"
                          style={{ fontSize: '13px', padding: '8px 16px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', boxShadow: 'none' }}
                        >
                          Leave a Review ★
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── ID Verification Modal ─────────────────────────────────── */}
      {showIdModal && (
        <IdModal verified={profileData.verified} onClose={() => setShowIdModal(false)} />
      )}
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────── */
const S = {
  // Layout
  page:    { minHeight: '100vh', backgroundColor: 'var(--bg-color)' },
  layout:  { display: 'flex', gap: '28px', maxWidth: '1100px', margin: '0 auto', padding: '0 24px 60px' },

  // Navbar
  navbar:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '32px', maxWidth: '1100px', margin: '0 auto 32px' },
  navBrand:{ display: 'flex', alignItems: 'center', gap: '10px' },
  logoCircle:{ borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  navTitle:{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' },
  navRight:{ display: 'flex', alignItems: 'center', gap: '12px' },
  userBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', padding: '8px 14px', borderRadius: '30px', fontSize: '14px', transition: 'all 0.2s' },
  avatarInitial: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 'bold' },
  backBtn: { background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', padding: '8px 16px', borderRadius: '8px', transition: 'background 0.2s' },
  logoutBtn:{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s' },

  // Sidebar
  sidebar: { width: '240px', flexShrink: 0 },
  sideCard:{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'sticky', top: '24px' },
  avatarWrap: { position: 'relative', marginBottom: '20px', width: '110px', height: '110px' },
  avatar:  { width: '110px', height: '110px', borderRadius: '50%', backgroundSize: 'cover', backgroundPosition: 'center', border: '3px solid var(--primary)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden', background: 'rgba(255,56,92,0.2)' },
  verifiedBadge: { position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10b981', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' },
  sidebarName: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' },
  rolePill:{ backgroundColor: 'rgba(255,56,92,0.15)', color: 'var(--primary)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' },
  memberSince: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' },
  sideStats:{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '24px', padding: '16px 0', borderTop: '1px solid var(--glass-border)', width: '100%', justifyContent: 'center' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 },
  statNum:  { fontSize: '18px', fontWeight: '800' },
  statLabel:{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statDivider:{ width: '1px', height: '32px', background: 'var(--glass-border)' },

  // Content
  content: { flex: 1, minWidth: 0 },
  tabBar:  { display: 'flex', gap: '0', borderBottom: '1px solid var(--glass-border)', marginBottom: '32px' },
  tabBtn:  { padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', fontFamily: 'inherit', transition: 'color 0.2s', borderBottom: '2px solid transparent' },
  tabContent:{ display: 'flex', flexDirection: 'column', gap: '36px' },

  // Sections
  section: { display: 'flex', flexDirection: 'column', gap: '14px' },
  sectionHead: { fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '2px' },
  profileName: { fontSize: '36px', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: 1.1 },
  profileAge:  { fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' },

  // Address card
  addressCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: '14px', padding: '16px 20px', cursor: 'pointer', width: '100%', transition: 'border-color 0.2s', fontFamily: 'inherit' },
  addrIcon:    { fontSize: '22px' },
  addrLabel:   { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  addrValue:   { fontSize: '14px', color: 'var(--text-main)', fontWeight: '500', lineHeight: 1.4 },
  verifiedChip:{ flexShrink: 0, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' },
  unverifiedChip:{ flexShrink: 0, backgroundColor: 'rgba(255,56,92,0.15)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' },

  // Bio
  bioCard:  { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' },
  bioText:  { fontSize: '15px', color: 'var(--text-main)', lineHeight: 1.7 },
  editLink: { alignSelf: 'flex-end', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', padding: 0, transition: 'color 0.2s' },

  // Languages
  langChip: { padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', borderRadius: '30px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' },
  addChipBtn: { padding: '8px 16px', background: 'transparent', border: '1px dashed var(--glass-border)', borderRadius: '30px', fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', transition: 'border-color 0.2s, color 0.2s' },

  // Interests
  interestChip:{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(255,56,92,0.1)', border: '1px solid rgba(255,56,92,0.25)', borderRadius: '30px', fontSize: '13px', fontWeight: '600', color: 'var(--primary)' },
  removeTag:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--primary)', padding: '0', lineHeight: 1, fontFamily: 'inherit' },
  interestPicker:{ marginTop: '16px', padding: '16px 20px' },
  pickerChip:  { padding: '7px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '30px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },

  // Reviews
  reviewCard:   { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  reviewProperty:{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' },
  reviewDate:   { fontSize: '12px', color: 'var(--text-muted)' },
  reviewText:   { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, fontStyle: 'italic' },

  // Trips
  tripCard:  { display: 'flex', overflow: 'hidden', border: '1px solid var(--glass-border)', transition: 'transform 0.2s' },
  tripImg:   { width: '200px', flexShrink: 0, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', minHeight: '160px' },
  completedBadge: { position: 'absolute', top: '10px', left: '10px', background: '#10b981', color: 'white', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' },
  tripBody:  { flex: 1, padding: '20px 24px' },
  tripTitle: { fontSize: '17px', fontWeight: '700', margin: 0 },
  tripPrice: { fontSize: '17px', fontWeight: '700', color: 'var(--primary)' },
  tripDetail:{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0' },
};

/* ─── Modal Styles ───────────────────────────────────────────────── */
const M = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' },
  modal:   { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px', maxWidth: '440px', width: '100%', position: 'relative', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' },
  closeBtn:{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' },
  verifiedIcon:{ width: '64px', height: '64px', background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#10b981', marginBottom: '20px' },
  modalTitle:{ fontSize: '22px', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)' },
  modalSub:  { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' },
  idCard:    { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' },
  idRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  idLabel:   { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  idVal:     { fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' },
  stepList:  { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  step:      { display: 'flex', alignItems: 'center', gap: '14px' },
  stepNum:   { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0 },
};
