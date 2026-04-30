import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BurgerMenu from '../components/BurgerMenu';
import api from '../api';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_COLORS = {
  PENDING: '#fcd34d',
  APPROVED: '#4ade80',
  REJECTED: '#f87171',
  CANCELLED: '#94a3b8',
};

export default function Trips({ username, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewDraft, setReviewDraft] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/bookings/me', { params })
      .then(r => setBookings(r.data))
      .catch(() => {
        setBookings([]);
        setError('Could not load your bookings. Make sure the backend is running.');
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const counts = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});
  }, [bookings]);

  const updateReview = (bookingId, key, value) => {
    setReviewDraft(prev => ({
      ...prev,
      [bookingId]: { rating: 5, comment: '', ...(prev[bookingId] || {}), [key]: value },
    }));
  };

  const submitReview = async (bookingId) => {
    const draft = reviewDraft[bookingId] || { rating: 5, comment: '' };
    setMessage('');
    try {
      await api.post(`/bookings/${bookingId}/review`, {
        rating: Number(draft.rating),
        comment: draft.comment,
      });
      setReviewDraft(prev => ({ ...prev, [bookingId]: { rating: 5, comment: '' } }));
      setMessage('Review submitted successfully.');
    } catch (err) {
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage('Could not submit review for this booking.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar} className="glass-panel">
        <div onClick={() => navigate('/home')} style={styles.navBrand}>
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
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.pageTitle}>My Trips</h1>
            <p style={styles.subtitle}>Track booking requests and owner decisions in one place.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/properties')} style={{ padding: '10px 18px' }}>
            Explore Stays
          </button>
        </div>

        <div style={styles.tabRow}>
          {FILTERS.map(filter => (
            <button
              key={filter.key || 'all'}
              onClick={() => setStatusFilter(filter.key)}
              style={{
                ...styles.tabBtn,
                background: statusFilter === filter.key ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: statusFilter === filter.key ? 'white' : 'var(--text-muted)',
                border: statusFilter === filter.key ? 'none' : '1px solid var(--glass-border)',
              }}
            >
              {filter.label}{filter.key && counts[filter.key] ? ` (${counts[filter.key]})` : ''}
            </button>
          ))}
        </div>

        {message && <div style={styles.message}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}
        {loading && <div className="glass-panel" style={styles.empty}>Loading bookings...</div>}

        {!loading && bookings.length === 0 && (
          <div className="glass-panel" style={styles.empty}>
            <p style={styles.emptyTitle}>No bookings found.</p>
            <p style={styles.detail}>Search properties and send your first booking request.</p>
            <button onClick={() => navigate('/properties')} className="btn-primary" style={{ marginTop: '18px' }}>Browse Properties</button>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div style={styles.list}>
            {bookings.map(booking => {
              const draft = reviewDraft[booking.id] || { rating: 5, comment: '' };
              return (
                <div key={booking.id} className="glass-panel" style={styles.card}>
                  <div style={styles.cardImg}>
                    <span style={{ ...styles.statusBadge, background: STATUS_COLORS[booking.status] || '#94a3b8' }}>
                      {booking.status}
                    </span>
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardHeader}>
                      <div>
                        <h3 style={styles.cardTitle}>{booking.propertyTitle}</h3>
                        <p style={styles.detail}>{booking.propertyLocation}</p>
                      </div>
                      <span style={styles.bookingId}>#{booking.id}</span>
                    </div>

                    <div style={styles.metaGrid}>
                      <span><strong>Check-In:</strong> {booking.checkInDate}</span>
                      <span><strong>Check-Out:</strong> {booking.checkOutDate}</span>
                      <span><strong>Guests:</strong> {booking.guests}</span>
                      <span><strong>Requested:</strong> {formatDate(booking.createdAt)}</span>
                    </div>

                    {booking.ownerDecisionNote && (
                      <p style={styles.note}><strong>Owner note:</strong> {booking.ownerDecisionNote}</p>
                    )}

                    <div style={styles.actions}>
                      <button
                        className="btn-primary"
                        style={styles.secondaryAction}
                        onClick={() => navigate(`/properties/${booking.propertyId}`)}
                      >
                        View Property
                      </button>
                    </div>

                    {booking.status === 'APPROVED' && (
                      <div style={styles.reviewBox}>
                        <strong>Leave a review</strong>
                        <div style={styles.reviewForm}>
                          <select value={draft.rating} onChange={e => updateReview(booking.id, 'rating', e.target.value)} style={styles.reviewSelect}>
                            {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} stars</option>)}
                          </select>
                          <input
                            value={draft.comment}
                            onChange={e => updateReview(booking.id, 'comment', e.target.value)}
                            placeholder="How was your stay?"
                            style={styles.reviewInput}
                          />
                          <button className="btn-primary" onClick={() => submitReview(booking.id)} style={{ padding: '8px 14px', fontSize: '13px' }}>
                            Submit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString();
}

const styles = {
  container: { padding: '24px', maxWidth: '980px', margin: '0 auto' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '48px' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  logoCircle: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: '20px', fontWeight: '800', color: 'var(--primary)' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', padding: '8px 14px', borderRadius: '30px', fontSize: '14px' },
  avatarInitial: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 'bold' },
  main: { paddingTop: '8px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', marginBottom: '26px' },
  pageTitle: { fontSize: '36px', fontWeight: 800, marginBottom: '8px', background: '-webkit-linear-gradient(45deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: 'var(--text-muted)', fontSize: '16px' },
  tabRow: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  tabBtn: { padding: '10px 18px', borderRadius: '30px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  list: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { display: 'flex', overflow: 'hidden', border: '1px solid var(--glass-border)' },
  cardImg: { width: '190px', flexShrink: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  statusBadge: { position: 'absolute', top: '12px', left: '12px', color: '#0f172a', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px' },
  cardBody: { flex: 1, padding: '24px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '14px' },
  cardTitle: { fontSize: '18px', fontWeight: 700, margin: 0 },
  bookingId: { color: 'var(--text-muted)', fontWeight: 700 },
  detail: { fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0' },
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px 18px', fontSize: '14px', color: 'var(--text-muted)', marginTop: '12px' },
  note: { marginTop: '12px', color: '#bfdbfe', fontSize: '14px', lineHeight: 1.5 },
  actions: { marginTop: '18px' },
  secondaryAction: { fontSize: '13px', padding: '8px 16px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', boxShadow: 'none' },
  reviewBox: { marginTop: '18px', padding: '14px', border: '1px solid var(--glass-border)', borderRadius: '14px', background: 'rgba(255,255,255,0.03)' },
  reviewForm: { display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '8px', marginTop: '10px' },
  reviewSelect: { padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.06)', color: 'var(--text-main)' },
  reviewInput: { padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.06)', color: 'var(--text-main)' },
  empty: { textAlign: 'center', padding: '56px 24px', color: 'var(--text-muted)' },
  emptyTitle: { color: 'var(--text-main)', fontSize: '20px', fontWeight: 800, marginBottom: '8px' },
  message: { padding: '10px 14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', color: '#4ade80' },
  error: { padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', color: '#f87171' },
};
