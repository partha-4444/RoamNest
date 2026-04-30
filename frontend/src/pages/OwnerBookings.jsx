import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function OwnerBookings({ username, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loading, setLoading] = useState(false);
  const [decisionNote, setDecisionNote] = useState({});
  const [actionMsg, setActionMsg] = useState('');
  const [actingId, setActingId] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/bookings/owner', { params })
      .then(r => setBookings(r.data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const decide = async (bookingId, action) => {
    if (action === 'reject' && !window.confirm('Reject this booking request? This decision will be visible to the guest.')) {
      return;
    }
    setActingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/${action}`, {
        ownerDecisionNote: decisionNote[bookingId] || null,
      });
      setActionMsg(`Booking #${bookingId} ${action}d successfully.`);
      setDecisionNote(prev => ({ ...prev, [bookingId]: '' }));
      load();
    } catch {
      setActionMsg(`Failed to ${action} booking.`);
    } finally {
      setActingId(null);
    }
  };

  const statusColor = (status) => {
    if (status === 'APPROVED') return '#4ade80';
    if (status === 'REJECTED') return '#f87171';
    if (status === 'PENDING') return '#fcd34d';
    return 'var(--text-muted)';
  };

  return (
    <div style={s.page}>
      <nav style={s.nav} className="glass-panel">
        <span style={s.brand} onClick={() => navigate('/home')}>◀ RoamNest</span>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <span style={{color: 'var(--text-muted)', fontSize: '14px'}}>{username}</span>
          <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h1 style={s.title}>Booking Requests</h1>
        <div style={{display: 'flex', gap: '8px'}}>
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                background: statusFilter === st ? 'var(--primary)' : 'transparent',
                border: `1px solid ${statusFilter === st ? 'var(--primary)' : 'var(--glass-border)'}`,
                color: statusFilter === st ? 'white' : 'var(--text-muted)',
              }}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      {actionMsg && (
        <div style={s.msg}>{actionMsg} <button onClick={() => setActionMsg('')} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',marginLeft:'8px'}}>✕</button></div>
      )}

      <div style={s.privacy}>
        <span style={s.privacyBadge}>Fairness Mode</span>
        <strong> Privacy notice:</strong> Guest identities are hidden to ensure fair, non-discriminatory booking decisions.
        Guest details appear only after a booking is approved.
      </div>

      {loading && <p style={{color: 'var(--text-muted)'}}>Loading…</p>}

      {!loading && bookings.length === 0 && (
        <div className="glass-panel" style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
          No booking requests found for the selected filter.
        </div>
      )}

      <div style={s.list}>
        {bookings.map(b => (
          <div key={b.id} className="glass-panel" style={s.card}>
            <div style={s.cardHeader}>
              <div>
                <h3 style={{margin: 0, fontSize: '16px'}}>{b.propertyTitle}</h3>
                <p style={{color: 'var(--text-muted)', fontSize: '13px', margin: '2px 0'}}>{b.propertyLocation}</p>
              </div>
              <span style={{color: statusColor(b.status), fontWeight: 700, fontSize: '13px'}}>{b.status}</span>
            </div>

            <div style={s.details}>
              <span><strong>Guest Ref:</strong> {b.guestRef}</span>
              {b.status === 'APPROVED' && b.guestUsername && (
                <>
                  <span><strong>Guest Name:</strong> {b.guestFullName || 'N/A'}</span>
                  <span><strong>Guest Username:</strong> {b.guestUsername}</span>
                  <span><strong>Guest Phone:</strong> {b.guestPhoneNo || 'N/A'}</span>
                  <span><strong>Guest Address:</strong> {b.guestAddress || 'N/A'}</span>
                </>
              )}
              <span><strong>Check-In:</strong> {b.checkInDate}</span>
              <span><strong>Check-Out:</strong> {b.checkOutDate}</span>
              <span><strong>Guests:</strong> {b.guests}</span>
              <span><strong>Requested:</strong> {formatDate(b.createdAt)}</span>
            </div>

            {b.ownerDecisionNote && (
              <p style={{fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 0'}}>
                <strong>Note:</strong> {b.ownerDecisionNote}
              </p>
            )}

            {b.status === 'PENDING' && (
              <div style={s.actions}>
                <input
                  type="text"
                  placeholder="Optional note to guest…"
                  value={decisionNote[b.id] || ''}
                  onChange={e => setDecisionNote(prev => ({ ...prev, [b.id]: e.target.value }))}
                  style={s.noteInput}
                />
                <div style={{display: 'flex', gap: '8px'}}>
                  <button
                    className="btn-primary"
                    style={{padding: '8px 20px', background: '#4ade80', border: 'none', color: '#0f172a'}}
                    onClick={() => decide(b.id, 'approve')}
                    disabled={actingId === b.id}
                  >
                    {actingId === b.id ? 'Working...' : 'Approve'}
                  </button>
                  <button
                    className="btn-primary"
                    style={{padding: '8px 20px', background: '#f87171', border: 'none', color: '#0f172a'}}
                    onClick={() => decide(b.id, 'reject')}
                    disabled={actingId === b.id}
                  >
                    {actingId === b.id ? 'Working...' : 'Reject'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString();
}

const s = {
  page: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '32px' },
  brand: { fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', fontSize: '16px' },
  logoutBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 },
  title: { fontSize: '28px', fontWeight: 800, margin: 0 },
  privacy: { padding: '10px 14px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', fontSize: '13px', marginBottom: '24px', color: '#93c5fd' },
  privacyBadge: { display: 'inline-block', padding: '3px 8px', borderRadius: '999px', background: 'rgba(56,189,248,0.2)', color: '#bfdbfe', fontWeight: 800, marginRight: '6px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.4px' },
  msg: { padding: '10px 14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { padding: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  details: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 24px', fontSize: '14px' },
  actions: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  noteInput: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
};
