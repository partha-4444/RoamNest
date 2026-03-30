import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BurgerMenu from '../components/BurgerMenu';

const CONVOS = [
  { id: 1, host: 'Priya S.', property: 'Sunset Villa, Goa', last: 'Looking forward to your stay! 🌅', time: '2m ago', unread: 2, avatar: 'P' },
  { id: 2, host: 'Rahul M.', property: 'Lakeside Cabin, Coorg', last: 'The cabin will be ready for check-in at 2 PM.', time: '1h ago', unread: 0, avatar: 'R' },
  { id: 3, host: 'Alex T.', property: 'Modern Retreat, NYC', last: 'Hi! Let me know if you have any questions.', time: 'Yesterday', unread: 1, avatar: 'A' },
  { id: 4, host: 'Made W.', property: 'Beachfront Bungalow, Bali', last: 'Thanks for staying with us! Hope to see you again.', time: '2 days ago', unread: 0, avatar: 'M' },
];

export default function Messages({ role, username, onLogout }) {
  const [selected, setSelected] = useState(CONVOS[0]);
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar} className="glass-panel">
        <div onClick={() => navigate('/home')} style={{ ...styles.navBrand, cursor: 'pointer' }}>
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

      <h1 style={styles.pageTitle}>Messages</h1>

      <div style={styles.layout}>
        {/* Sidebar: conversation list */}
        <div className="glass-panel" style={styles.sidebar}>
          {CONVOS.map((c) => (
            <div
              key={c.id}
              id={`convo-${c.id}`}
              onClick={() => setSelected(c)}
              style={{
                ...styles.convoItem,
                background: selected?.id === c.id ? 'rgba(255,56,92,0.12)' : 'transparent',
                borderLeft: selected?.id === c.id ? '3px solid var(--primary)' : '3px solid transparent',
              }}
            >
              <div style={{ ...styles.avatar, background: `hsl(${c.id * 80}, 60%, 50%)` }}>{c.avatar}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={styles.convoTop}>
                  <span style={styles.hostName}>{c.host}</span>
                  <span style={styles.time}>{c.time}</span>
                </div>
                <p style={styles.propName}>{c.property}</p>
                <p style={styles.lastMsg}>{c.last}</p>
              </div>
              {c.unread > 0 && <div style={styles.unreadBadge}>{c.unread}</div>}
            </div>
          ))}
        </div>

        {/* Main chat area */}
        <div className="glass-panel" style={styles.chatPanel}>
          {selected ? (
            <>
              <div style={styles.chatHeader}>
                <div style={{ ...styles.avatar, background: `hsl(${selected.id * 80}, 60%, 50%)` }}>{selected.avatar}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{selected.host}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{selected.property}</p>
                </div>
              </div>

              <div style={styles.messagesArea}>
                <div style={styles.msgBubbleHost}>{selected.last}</div>
                <div style={styles.msgBubbleUser}>Thanks! Really looking forward to it 😊</div>
              </div>

              <div style={styles.inputRow}>
                <input
                  style={styles.msgInput}
                  placeholder="Type a message..."
                />
                <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '12px', flexShrink: 0 }}>Send ↑</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '80px' }}>
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '32px' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoCircle: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: '20px', fontWeight: '800', color: 'var(--primary)' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600', padding: '8px 14px', borderRadius: '30px', fontSize: '14px', transition: 'all 0.2s' },
  avatarInitial: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #fb7185)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 'bold' },
  pageTitle: { fontSize: '32px', fontWeight: 800, marginBottom: '24px', background: '-webkit-linear-gradient(45deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  layout: { display: 'flex', gap: '16px', height: '560px' },
  sidebar: { width: '300px', flexShrink: 0, overflowY: 'auto', padding: '8px', border: '1px solid var(--glass-border)' },
  convoItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 12px', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.15s', position: 'relative' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px' },
  convoTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' },
  hostName: { fontWeight: 700, fontSize: '15px' },
  time: { fontSize: '12px', color: 'var(--text-muted)' },
  propName: { fontSize: '12px', color: 'var(--primary)', margin: '0 0 4px', fontWeight: 600 },
  lastMsg: { fontSize: '13px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' },
  unreadBadge: { background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 },
  chatPanel: { flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', overflow: 'hidden' },
  chatHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--glass-border)' },
  messagesArea: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  msgBubbleHost: { alignSelf: 'flex-start', background: 'rgba(255,255,255,0.07)', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', maxWidth: '70%', fontSize: '14px', lineHeight: '1.5' },
  msgBubbleUser: { alignSelf: 'flex-end', background: 'var(--primary)', color: 'white', padding: '12px 16px', borderRadius: '16px 16px 4px 16px', maxWidth: '70%', fontSize: '14px', lineHeight: '1.5' },
  inputRow: { display: 'flex', gap: '10px', padding: '16px', borderTop: '1px solid var(--glass-border)' },
  msgInput: { flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '10px 16px', color: 'var(--text-main)', fontSize: '14px', outline: 'none' },
};
