import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BurgerMenu from '../components/BurgerMenu';
import api from '../api';

const STATUS_COLORS = {
  APPROVED: '#4ade80',
  PENDING: '#fcd34d',
  REJECTED: '#f87171',
  CANCELLED: '#94a3b8',
};

function Stars({ rating }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span style={{ color: '#ff385c', fontSize: '14px', letterSpacing: '1px' }}>
      {'★'.repeat(safeRating)}{'☆'.repeat(5 - safeRating)}
    </span>
  );
}

function formatDate(value) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString();
}

function formatTripDates(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return 'Dates unavailable';
  return `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`;
}

function getNights(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return null;
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

export default function Profile({ role, username, onLogout }) {
  const navigate = useNavigate();
  const isUser = role === 'USER';

  const [activeTab, setActiveTab] = useState('about');
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isUser && activeTab === 'trips') {
      setActiveTab('about');
    }
  }, [activeTab, isUser]);

  useEffect(() => {
    setLoadingProfile(true);
    setError('');
    api.get('/users/me')
      .then(r => setProfile(r.data))
      .catch(() => setError('Could not load profile details. Make sure the backend is running.'))
      .finally(() => setLoadingProfile(false));
  }, []);

  useEffect(() => {
    if (!isUser) {
      setBookings([]);
      setReviews([]);
      return;
    }

    setLoadingUserData(true);
    Promise.all([
      api.get('/bookings/me'),
      api.get('/users/me/reviews'),
    ])
      .then(([bookingsResponse, reviewsResponse]) => {
        setBookings(bookingsResponse.data || []);
        setReviews(reviewsResponse.data || []);
      })
      .catch(() => {
        setBookings([]);
        setReviews([]);
      })
      .finally(() => setLoadingUserData(false));
  }, [isUser]);

  const displayName = profile?.fullName || profile?.username || username || 'RoamNest Guest';
  const displayUsername = profile?.username || username || 'N/A';
  const displayRole = profile?.role || role;

  const completedTrips = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings.filter(booking => (
      booking.status === 'APPROVED'
      && booking.checkOutDate
      && new Date(booking.checkOutDate) < today
    ));
  }, [bookings]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const tabs = isUser
    ? [{ key: 'about', label: 'About Me' }, { key: 'trips', label: 'Past Trips' }]
    : [{ key: 'about', label: 'About Me' }];

  return (
    <div style={S.page}>
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
                <span style={S.avatarInitial}>{displayUsername?.[0]?.toUpperCase()}</span>
                <span>{displayUsername}</span>
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

      <div style={S.layout}>
        <aside style={S.sidebar}>
          <div className="glass-panel" style={S.sideCard}>
            <div style={S.avatarWrap}>
              <div style={S.avatar}>
                {displayName?.[0]?.toUpperCase()}
              </div>
            </div>

            <h2 style={S.sidebarName}>{displayName}</h2>
            <div style={S.rolePill}>{displayRole}</div>
            <p style={S.memberSince}>@{displayUsername}</p>

            {isUser && (
              <div style={S.sideStats}>
                <div style={S.statItem}>
                  <span style={S.statNum}>{completedTrips.length}</span>
                  <span style={S.statLabel}>Trips</span>
                </div>
                <div style={S.statDivider} />
                <div style={S.statItem}>
                  <span style={S.statNum}>{reviews.length}</span>
                  <span style={S.statLabel}>Reviews</span>
                </div>
                <div style={S.statDivider} />
                <div style={S.statItem}>
                  <span style={S.statNum}>{averageRating || '-'}</span>
                  <span style={S.statLabel}>Rating</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        <div style={S.content}>
          <div style={S.tabBar}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...S.tabBtn,
                  color: activeTab === tab.key ? 'var(--text-main)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && <div style={S.errorBox}>{error}</div>}
          {loadingProfile && <div className="glass-panel" style={S.empty}>Loading profile...</div>}

          {!loadingProfile && activeTab === 'about' && (
            <div style={S.tabContent}>
              <section style={S.section}>
                <h1 style={S.profileName}>{displayName}</h1>
                <p style={S.profileAge}>{displayRole} account</p>
              </section>

              <section style={S.section}>
                <h3 style={S.sectionHead}>Account Details</h3>
                <div className="glass-panel" style={S.detailGrid}>
                  <Detail label="Username" value={displayUsername} />
                  <Detail label="Full Name" value={profile?.fullName} />
                  <Detail label="Phone Number" value={profile?.phoneNo} />
                  <Detail label="Home Address" value={profile?.address} wide />
                </div>
              </section>

              {isUser && (
                <section style={S.section}>
                  <h3 style={S.sectionHead}>Reviews I've Written</h3>
                  {loadingUserData ? (
                    <div className="glass-panel" style={S.empty}>Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="glass-panel" style={S.empty}>
                      You have not written any reviews yet. Completed approved trips can be reviewed from My Trips.
                    </div>
                  ) : (
                    <>
                      <p style={S.sectionSubtle}>
                        {reviews.length} review{reviews.length !== 1 ? 's' : ''} written
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {reviews.map(review => (
                          <div key={review.id} className="glass-panel" style={S.reviewCard}>
                            <div style={S.reviewHeader}>
                              <div>
                                <p style={S.reviewProperty}>{review.propertyTitle}</p>
                                <p style={S.reviewDate}>
                                  {review.propertyLocation} - {formatDate(review.createdAt)}
                                </p>
                              </div>
                              <Stars rating={review.rating} />
                            </div>
                            <p style={S.reviewText}>
                              {review.comment ? `"${review.comment}"` : 'No written comment.'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}
            </div>
          )}

          {isUser && activeTab === 'trips' && (
            <div style={S.tabContent}>
              <p style={S.sectionSubtle}>Completed approved journeys with RoamNest.</p>
              {loadingUserData ? (
                <div className="glass-panel" style={S.empty}>Loading trips...</div>
              ) : completedTrips.length === 0 ? (
                <div className="glass-panel" style={S.empty}>
                  No completed trips yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {completedTrips.map(trip => {
                    const nights = getNights(trip.checkInDate, trip.checkOutDate);
                    return (
                      <div key={trip.id} className="glass-panel" style={S.tripCard}>
                        <div style={S.tripImg}>
                          <span style={S.completedBadge}>Completed</span>
                        </div>
                        <div style={S.tripBody}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <h3 style={S.tripTitle}>{trip.propertyTitle}</h3>
                            <span style={{ ...S.statusBadge, background: STATUS_COLORS[trip.status] || '#94a3b8' }}>
                              {trip.status}
                            </span>
                          </div>
                          <p style={S.tripDetail}>{trip.propertyLocation}</p>
                          <p style={S.tripDetail}>
                            {formatTripDates(trip.checkInDate, trip.checkOutDate)}
                            {nights ? ` - ${nights} night${nights === 1 ? '' : 's'}` : ''}
                          </p>
                          <p style={S.tripDetail}>Guests: {trip.guests}</p>
                          <button
                            className="btn-primary"
                            style={S.secondaryAction}
                            onClick={() => navigate(`/properties/${trip.propertyId}`)}
                          >
                            View Property
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, wide = false }) {
  return (
    <div style={wide ? { ...S.detailItem, gridColumn: '1 / -1' } : S.detailItem}>
      <span style={S.detailLabel}>{label}</span>
      <span style={S.detailValue}>{value || 'Not provided'}</span>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', backgroundColor: 'var(--bg-color)' },
  layout: { display: 'flex', gap: '28px', maxWidth: '1100px', margin: '0 auto', padding: '0 24px 60px' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '32px', maxWidth: '1100px', margin: '0 auto 32px' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoCircle: { borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: '20px', fontWeight: '800', color: 'var(--primary)' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', padding: '8px 14px', borderRadius: '30px', fontSize: '14px' },
  avatarInitial: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 'bold' },
  backBtn: { background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', padding: '8px 16px', borderRadius: '8px' },
  logoutBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' },
  sidebar: { width: '240px', flexShrink: 0 },
  sideCard: { padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'sticky', top: '24px' },
  avatarWrap: { marginBottom: '20px', width: '110px', height: '110px' },
  avatar: { width: '110px', height: '110px', borderRadius: '50%', border: '3px solid var(--primary)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', background: 'linear-gradient(135deg, rgba(255,56,92,0.45), rgba(251,113,133,0.24))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 800, color: 'white' },
  sidebarName: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' },
  rolePill: { backgroundColor: 'rgba(255,56,92,0.15)', color: 'var(--primary)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' },
  memberSince: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' },
  sideStats: { display: 'flex', alignItems: 'center', marginTop: '24px', padding: '16px 0', borderTop: '1px solid var(--glass-border)', width: '100%', justifyContent: 'center' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 },
  statNum: { fontSize: '18px', fontWeight: '800' },
  statLabel: { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statDivider: { width: '1px', height: '32px', background: 'var(--glass-border)' },
  content: { flex: 1, minWidth: 0 },
  tabBar: { display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '32px' },
  tabBtn: { padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', fontFamily: 'inherit', borderBottom: '2px solid transparent' },
  tabContent: { display: 'flex', flexDirection: 'column', gap: '36px' },
  section: { display: 'flex', flexDirection: 'column', gap: '14px' },
  sectionHead: { fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '2px' },
  sectionSubtle: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '-8px' },
  profileName: { fontSize: '36px', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: 1.1 },
  profileAge: { fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' },
  detailGrid: { padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' },
  detailItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
  detailLabel: { color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 },
  detailValue: { color: 'var(--text-main)', fontSize: '15px', lineHeight: 1.5 },
  reviewCard: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  reviewProperty: { fontSize: '15px', fontWeight: '700', marginBottom: '2px' },
  reviewDate: { fontSize: '12px', color: 'var(--text-muted)' },
  reviewText: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, fontStyle: 'italic' },
  tripCard: { display: 'flex', overflow: 'hidden', border: '1px solid var(--glass-border)' },
  tripImg: { width: '180px', flexShrink: 0, minHeight: '150px', background: 'linear-gradient(135deg, rgba(255,56,92,0.24), rgba(15,23,42,0.75))', position: 'relative' },
  completedBadge: { position: 'absolute', top: '10px', left: '10px', background: '#10b981', color: 'white', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' },
  statusBadge: { color: '#0f172a', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px' },
  tripBody: { flex: 1, padding: '20px 24px' },
  tripTitle: { fontSize: '17px', fontWeight: '700', margin: 0 },
  tripDetail: { fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0' },
  secondaryAction: { fontSize: '13px', padding: '8px 16px', marginTop: '16px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', boxShadow: 'none' },
  empty: { padding: '24px', color: 'var(--text-muted)', textAlign: 'center' },
  errorBox: { padding: '12px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', marginBottom: '18px', fontSize: '14px' },
};
