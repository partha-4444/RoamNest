import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AdminDashboard({ username, onLogout }) {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingStatus, setBookingStatus] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/summary').then(r => setSummary(r.data)).catch(() => setError('Failed to load summary'));
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {});
    }
    if (activeTab === 'properties') {
      api.get('/admin/properties').then(r => setProperties(r.data)).catch(() => {});
    }
    if (activeTab === 'bookings') {
      const params = bookingStatus ? { status: bookingStatus } : {};
      api.get('/admin/bookings', { params }).then(r => setBookings(r.data)).catch(() => {});
    }
  }, [activeTab, bookingStatus]);

  const statCard = (label, value, sub) => (
    <div className="glass-panel" style={s.statCard}>
      <div style={s.statLabel}>{label}</div>
      <div style={s.statValue}>{value ?? '—'}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  );

  return (
    <div style={s.page}>
      <nav style={s.nav} className="glass-panel">
        <span style={s.brand} onClick={() => navigate('/home')}>◀ RoamNest Admin</span>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <span style={{color: 'var(--text-muted)', fontSize: '14px'}}>{username}</span>
          <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>

      <h1 style={s.title}>Platform Administration</h1>

      {error && <div style={s.error}>{error}</div>}

      {summary && (
        <div style={s.statsGrid}>
          {statCard('Total Users', summary.adminCount + summary.ownerCount + summary.userCount,
            `${summary.adminCount} admin · ${summary.ownerCount} owners · ${summary.userCount} guests`)}
          {statCard('Properties', summary.totalProperties, `${summary.availableProperties} available`)}
          {statCard('Bookings', summary.pendingBookings + summary.approvedBookings + summary.rejectedBookings,
            `${summary.pendingBookings} pending · ${summary.approvedBookings} approved · ${summary.rejectedBookings} rejected`)}
          {statCard('Avg Rating', summary.overallAverageRating > 0 ? `★ ${summary.overallAverageRating.toFixed(2)}` : 'No reviews yet', null)}
        </div>
      )}

      <div style={s.tabs}>
        {['summary', 'users', 'properties', 'bookings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{...s.tab, ...(activeTab === tab ? s.tabActive : {})}}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && summary && (
        <div className="glass-panel" style={s.panel}>
          <h3>Platform Health</h3>
          <table style={s.table}>
            <tbody>
              <tr><td style={s.td}>Cancelled Bookings</td><td style={s.td}>{summary.cancelledBookings}</td></tr>
              <tr><td style={s.td}>Available Properties</td><td style={s.td}>{summary.availableProperties} / {summary.totalProperties}</td></tr>
              <tr><td style={s.td}>Rejection Rate</td><td style={s.td}>
                {summary.approvedBookings + summary.rejectedBookings > 0
                  ? `${((summary.rejectedBookings / (summary.approvedBookings + summary.rejectedBookings)) * 100).toFixed(1)}%`
                  : 'N/A'}
              </td></tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-panel" style={s.panel}>
          <h3>All Users ({users.length})</h3>
          <table style={s.table}>
            <thead>
              <tr>{['ID', 'Name', 'Username', 'Role', 'Phone'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={s.td}>{u.id}</td>
                  <td style={s.td}>{u.fullName}</td>
                  <td style={s.td}>{u.username}</td>
                  <td style={s.td}><span style={{...s.badge, background: roleBadge(u.role)}}>{u.role}</span></td>
                  <td style={s.td}>{u.phoneNo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'properties' && (
        <div className="glass-panel" style={s.panel}>
          <h3>All Properties ({properties.length})</h3>
          <table style={s.table}>
            <thead>
              <tr>{['ID', 'Title', 'Owner', 'Location', 'Price/Night', 'Guests', 'Available', 'Rating'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id}>
                  <td style={s.td}>{p.id}</td>
                  <td style={s.td}>{p.title}</td>
                  <td style={s.td}>{p.ownerUsername}</td>
                  <td style={s.td}>{p.location}</td>
                  <td style={s.td}>${p.pricePerNight}</td>
                  <td style={s.td}>{p.maxGuests}</td>
                  <td style={s.td}>{p.available ? '✓' : '✗'}</td>
                  <td style={s.td}>{p.reviewSummary?.reviewCount > 0 ? `★ ${p.reviewSummary.averageRating.toFixed(1)} (${p.reviewSummary.reviewCount})` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="glass-panel" style={s.panel}>
          <div style={{display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center'}}>
            <h3 style={{margin: 0}}>All Bookings ({bookings.length})</h3>
            <select
              value={bookingStatus}
              onChange={e => setBookingStatus(e.target.value)}
              style={{marginLeft: 'auto', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', cursor: 'pointer'}}
            >
              <option value="">All statuses</option>
              {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <table style={s.table}>
            <thead>
              <tr>{['ID', 'Property', 'Guest', 'Check-In', 'Check-Out', 'Guests', 'Status', 'Decision Note'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td style={s.td}>{b.id}</td>
                  <td style={s.td}>{b.propertyTitle}</td>
                  <td style={s.td}>{b.guestUsername}</td>
                  <td style={s.td}>{b.checkInDate}</td>
                  <td style={s.td}>{b.checkOutDate}</td>
                  <td style={s.td}>{b.guests}</td>
                  <td style={s.td}><span style={{...s.badge, background: statusBadge(b.status)}}>{b.status}</span></td>
                  <td style={s.td}>{b.ownerDecisionNote || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function roleBadge(role) {
  if (role === 'ADMIN') return 'rgba(56,189,248,0.25)';
  if (role === 'OWNER') return 'rgba(252,211,77,0.25)';
  return 'rgba(167,243,208,0.25)';
}

function statusBadge(status) {
  if (status === 'APPROVED') return 'rgba(167,243,208,0.25)';
  if (status === 'REJECTED') return 'rgba(252,165,165,0.25)';
  if (status === 'PENDING') return 'rgba(252,211,77,0.25)';
  return 'rgba(148,163,184,0.2)';
}

const s = {
  page: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '32px' },
  brand: { fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', fontSize: '16px' },
  logoutBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 },
  title: { fontSize: '32px', fontWeight: 800, marginBottom: '24px' },
  error: { padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '16px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' },
  statCard: { padding: '20px', textAlign: 'center' },
  statLabel: { color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: 800, marginBottom: '4px' },
  statSub: { color: 'var(--text-muted)', fontSize: '12px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '16px' },
  tab: { padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 },
  tabActive: { background: 'var(--primary)', color: 'white', border: '1px solid var(--primary)' },
  panel: { padding: '24px', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--glass-border)' },
  td: { padding: '10px 12px', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' },
  badge: { padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 },
};
