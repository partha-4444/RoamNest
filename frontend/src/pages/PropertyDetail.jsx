import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function PropertyDetail({ role, username, onLogout }) {
  const { propertyId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [property, setProperty] = useState(state?.property || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(!state?.property);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState({ checkInDate: '', checkOutDate: '', guests: 1 });
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      api.get(`/properties/${propertyId}`),
      api.get(`/properties/${propertyId}/reviews`).catch(() => ({ data: [] })),
    ])
      .then(([propertyResponse, reviewResponse]) => {
        if (!active) return;
        setProperty(propertyResponse.data);
        setReviews(reviewResponse.data);
      })
      .catch(() => {
        if (active) setError('Could not load this property.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [propertyId]);

  const set = (key, value) => setBooking(prev => ({ ...prev, [key]: value }));

  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingMsg('');
    setBookingError('');

    if (booking.checkOutDate <= booking.checkInDate) {
      setBookingError('Check-out date must be after check-in date.');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        propertyId: Number(propertyId),
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        guests: Number(booking.guests),
      });
      setBookingMsg('Booking request sent for owner approval.');
      setTimeout(() => navigate('/trips'), 700);
    } catch (err) {
      if (err.response?.status === 409) {
        setBookingError('This stay is already booked for those dates.');
      } else if (err.response?.data?.message) {
        setBookingError(err.response.data.message);
      } else {
        setBookingError('Could not send booking request.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const summary = property?.reviewSummary;

  return (
    <div style={s.page}>
      <nav style={s.nav} className="glass-panel">
        <span style={s.brand} onClick={() => navigate('/properties')}>RoamNest Stays</span>
        <div style={s.navRight}>
          <span style={s.username}>{username}</span>
          <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>

      {loading && <div className="glass-panel" style={s.notice}>Loading property...</div>}
      {error && <div style={s.error}>{error}</div>}

      {!loading && property && (
        <>
          <section className="glass-panel" style={s.hero}>
            <div style={s.image} />
            <div style={s.heroBody}>
              <div style={s.heroTop}>
                <div>
                  <h1 style={s.title}>{property.title}</h1>
                  <p style={s.location}>{property.location}{property.address ? `, ${property.address}` : ''}</p>
                </div>
                <div style={s.rating}>
                  {summary?.reviewCount > 0 ? (
                    <>
                      <strong>{Number(summary.averageRating).toFixed(1)}</strong>
                      <span>{summary.reviewCount} review{summary.reviewCount === 1 ? '' : 's'}</span>
                    </>
                  ) : (
                    <span>No reviews yet</span>
                  )}
                </div>
              </div>
              <p style={s.description}>{property.description || 'A comfortable RoamNest stay ready for your next trip.'}</p>
              <div style={s.factRow}>
                <span style={s.fact}>${property.pricePerNight} / night</span>
                <span style={s.fact}>Up to {property.maxGuests} guests</span>
                <span style={s.fact}>{property.available ? 'Available' : 'Unavailable'}</span>
              </div>
            </div>
          </section>

          <div style={s.contentGrid}>
            <section className="glass-panel" style={s.panel}>
              <h2 style={s.sectionTitle}>Reviews</h2>
              {reviews.length === 0 ? (
                <p style={s.muted}>No reviews yet. Approved guests can review after their stay.</p>
              ) : (
                <div style={s.reviewList}>
                  {reviews.map(review => (
                    <div key={review.id} style={s.review}>
                      <div style={s.reviewHeader}>
                        <strong>{review.guestDisplayName || 'Guest'}</strong>
                        <span style={s.reviewRating}>{'★'.repeat(review.rating)}</span>
                      </div>
                      <p style={s.reviewText}>{review.comment || 'No comment provided.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {role === 'USER' && (
              <aside className="glass-panel" style={s.panel}>
                <h2 style={s.sectionTitle}>Request Booking</h2>
                <p style={s.muted}>The owner will approve or reject this request without seeing your identity.</p>
                {bookingMsg && <div style={s.success}>{bookingMsg}</div>}
                {bookingError && <div style={s.error}>{bookingError}</div>}
                <form onSubmit={submitBooking} style={s.bookingForm}>
                  <label style={s.field}>
                    <span style={s.label}>Check-In</span>
                    <input type="date" className="input-field" value={booking.checkInDate} onChange={e => set('checkInDate', e.target.value)} required />
                  </label>
                  <label style={s.field}>
                    <span style={s.label}>Check-Out</span>
                    <input type="date" className="input-field" value={booking.checkOutDate} onChange={e => set('checkOutDate', e.target.value)} required />
                  </label>
                  <label style={s.field}>
                    <span style={s.label}>Guests</span>
                    <input type="number" min="1" max={property.maxGuests} className="input-field" value={booking.guests} onChange={e => set('guests', e.target.value)} required />
                  </label>
                  <button className="btn-primary" type="submit" disabled={bookingLoading || !property.available} style={{ width: '100%' }}>
                    {bookingLoading ? 'Sending...' : 'Send Booking Request'}
                  </button>
                </form>
              </aside>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  page: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '32px' },
  brand: { fontWeight: 800, color: 'var(--primary)', cursor: 'pointer', fontSize: '18px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  username: { color: 'var(--text-muted)', fontSize: '14px' },
  logoutBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 },
  notice: { padding: '28px', color: 'var(--text-muted)' },
  hero: { overflow: 'hidden', marginBottom: '24px' },
  image: { minHeight: '340px', backgroundImage: 'linear-gradient(rgba(15,23,42,0.1), rgba(15,23,42,0.35)), url(https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' },
  heroBody: { padding: '28px' },
  heroTop: { display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'flex-start' },
  title: { fontSize: '36px', fontWeight: 800, margin: 0 },
  location: { color: 'var(--text-muted)', marginTop: '8px' },
  rating: { padding: '10px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '110px', color: 'var(--text-muted)' },
  description: { color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '20px' },
  factRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '22px' },
  fact: { padding: '8px 12px', border: '1px solid var(--glass-border)', borderRadius: '999px', fontWeight: 700, fontSize: '13px' },
  contentGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '24px', alignItems: 'start' },
  panel: { padding: '24px' },
  sectionTitle: { margin: '0 0 12px', fontSize: '22px' },
  muted: { color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 },
  reviewList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  review: { padding: '14px', border: '1px solid var(--glass-border)', borderRadius: '14px', background: 'rgba(255,255,255,0.03)' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', gap: '12px' },
  reviewRating: { color: '#fcd34d' },
  reviewText: { color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 },
  bookingForm: { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' },
  success: { padding: '10px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '10px', color: '#4ade80', margin: '14px 0', fontSize: '14px' },
  error: { padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', margin: '14px 0', fontSize: '14px' },
};
