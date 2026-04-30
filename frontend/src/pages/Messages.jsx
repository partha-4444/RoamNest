import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BurgerMenu from '../components/BurgerMenu';
import api from '../api';

export default function Messages({ role, username, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    const request = role === 'OWNER'
      ? api.get('/bookings/owner', { params: { status: 'APPROVED' } })
      : api.get('/bookings/me', { params: { status: 'APPROVED' } });

    request
      .then(r => {
        setBookings(r.data);
        setSelectedBooking(r.data[0] || null);
      })
      .catch(() => {
        setBookings([]);
        setError('Could not load approved bookings for messaging.');
      })
      .finally(() => setLoading(false));
  }, [role]);

  useEffect(() => {
    if (!selectedBooking) {
      setMessages([]);
      return;
    }

    setThreadLoading(true);
    api.get(`/bookings/${selectedBooking.id}/messages`)
      .then(r => setMessages(r.data))
      .catch(() => setMessages([]))
      .finally(() => setThreadLoading(false));
  }, [selectedBooking]);

  const send = async (e) => {
    e.preventDefault();
    const message = draft.trim();
    if (!message || !selectedBooking) return;

    setDraft('');
    try {
      const response = await api.post(`/bookings/${selectedBooking.id}/messages`, { message });
      setMessages(prev => [...prev, response.data]);
    } catch {
      setError('Could not send message.');
      setDraft(message);
    }
  };

  const isOwner = role === 'OWNER';

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
          {isOwner ? <button onClick={onLogout} style={styles.logoutBtn}>Logout</button> : <BurgerMenu onLogout={onLogout} />}
        </div>
      </nav>

      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.pageTitle}>Messages</h1>
          <p style={styles.subtitle}>Chat is available after a booking is approved.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate(isOwner ? '/owner/bookings' : '/trips')} style={{ padding: '10px 18px' }}>
          {isOwner ? 'Booking Queue' : 'My Trips'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.layout}>
        <div className="glass-panel" style={styles.sidebar}>
          {loading && <p style={styles.emptyText}>Loading conversations...</p>}
          {!loading && bookings.length === 0 && (
            <div style={styles.emptySidebar}>
              <strong>No conversations yet</strong>
              <p>Approved bookings will appear here.</p>
            </div>
          )}
          {!loading && bookings.map((booking) => (
            <button
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              style={{
                ...styles.convoItem,
                background: selectedBooking?.id === booking.id ? 'rgba(255,56,92,0.12)' : 'transparent',
                borderLeft: selectedBooking?.id === booking.id ? '3px solid var(--primary)' : '3px solid transparent',
              }}
            >
              <div style={styles.avatar}>{booking.propertyTitle?.[0] || 'R'}</div>
              <div style={{ flex: 1, overflow: 'hidden', textAlign: 'left' }}>
                <div style={styles.convoTop}>
                  <span style={styles.hostName}>{booking.propertyTitle}</span>
                  <span style={styles.time}>#{booking.id}</span>
                </div>
                <p style={styles.propName}>{booking.propertyLocation}</p>
                <p style={styles.lastMsg}>
                  {isOwner ? `Guest ${booking.guestRef || ''}` : 'Owner conversation'}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="glass-panel" style={styles.chatPanel}>
          {selectedBooking ? (
            <>
              <div style={styles.chatHeader}>
                <div style={styles.avatar}>{selectedBooking.propertyTitle?.[0] || 'R'}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{selectedBooking.propertyTitle}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    {selectedBooking.checkInDate} to {selectedBooking.checkOutDate}
                  </p>
                </div>
              </div>

              <div style={styles.messagesArea}>
                {threadLoading && <p style={styles.emptyText}>Loading messages...</p>}
                {!threadLoading && messages.length === 0 && (
                  <div style={styles.threadEmpty}>No messages yet. Send the first check-in note.</div>
                )}
                {!threadLoading && messages.map(message => {
                  const mine = message.senderRole === (isOwner ? 'OWNER' : 'GUEST');
                  return (
                    <div key={message.id} style={mine ? styles.msgBubbleUser : styles.msgBubbleOther}>
                      <div style={styles.msgRole}>{message.senderRole === 'OWNER' ? 'Owner' : 'Guest'}</div>
                      <div>{message.message}</div>
                      <div style={styles.msgTime}>{formatDate(message.createdAt)}</div>
                    </div>
                  );
                })}
              </div>

              <form style={styles.inputRow} onSubmit={send}>
                <input
                  style={styles.msgInput}
                  placeholder="Type a message..."
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                />
                <button className="btn-primary" type="submit" style={{ padding: '10px 20px', borderRadius: '12px', flexShrink: 0 }}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div style={styles.noSelection}>Select an approved booking to start messaging.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '32px' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  logoCircle: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: '20px', fontWeight: '800', color: 'var(--primary)' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', padding: '8px 14px', borderRadius: '30px', fontSize: '14px' },
  avatarInitial: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 'bold' },
  logoutBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', marginBottom: '22px' },
  pageTitle: { fontSize: '32px', fontWeight: 800, marginBottom: '8px', background: '-webkit-linear-gradient(45deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: 'var(--text-muted)', fontSize: '15px' },
  layout: { display: 'flex', gap: '16px', height: '590px' },
  sidebar: { width: '330px', flexShrink: 0, overflowY: 'auto', padding: '8px', border: '1px solid var(--glass-border)' },
  convoItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 12px', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.15s', position: 'relative', width: '100%', color: 'var(--text-main)', borderTop: 'none', borderRight: 'none', borderBottom: 'none' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px', background: 'linear-gradient(135deg, var(--primary), #38bdf8)' },
  convoTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', gap: '8px' },
  hostName: { fontWeight: 700, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  time: { fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 },
  propName: { fontSize: '12px', color: 'var(--primary)', margin: '0 0 4px', fontWeight: 600 },
  lastMsg: { fontSize: '13px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '210px' },
  chatPanel: { flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', overflow: 'hidden' },
  chatHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--glass-border)' },
  messagesArea: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  msgBubbleOther: { alignSelf: 'flex-start', background: 'rgba(255,255,255,0.07)', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', maxWidth: '70%', fontSize: '14px', lineHeight: 1.5 },
  msgBubbleUser: { alignSelf: 'flex-end', background: 'var(--primary)', color: 'white', padding: '12px 16px', borderRadius: '16px 16px 4px 16px', maxWidth: '70%', fontSize: '14px', lineHeight: 1.5 },
  msgRole: { fontSize: '11px', fontWeight: 800, opacity: 0.75, marginBottom: '4px', textTransform: 'uppercase' },
  msgTime: { fontSize: '11px', opacity: 0.7, marginTop: '6px' },
  inputRow: { display: 'flex', gap: '10px', padding: '16px', borderTop: '1px solid var(--glass-border)' },
  msgInput: { flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '10px 16px', color: 'var(--text-main)', fontSize: '14px', outline: 'none' },
  emptyText: { color: 'var(--text-muted)', padding: '12px', fontSize: '14px' },
  emptySidebar: { padding: '24px 14px', color: 'var(--text-muted)', lineHeight: 1.5 },
  threadEmpty: { margin: 'auto', color: 'var(--text-muted)', textAlign: 'center' },
  noSelection: { margin: 'auto', color: 'var(--text-muted)', textAlign: 'center' },
  error: { padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', color: '#f87171' },
};
