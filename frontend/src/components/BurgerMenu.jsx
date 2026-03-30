import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

export default function BurgerMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const navigate = useNavigate();

  // Compute dropdown position from button position each time it opens
  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + window.scrollY + 10,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        // Also allow clicks inside the dropdown itself
        const ddEl = document.getElementById('burger-dropdown');
        if (ddEl && ddEl.contains(e.target)) return;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const menuItems = [
    { label: 'Wishlists', icon: '♡', path: '/wishlists' },
    { label: 'Trips',     icon: '✈', path: '/trips' },
    { label: 'Messages',  icon: '✉', path: '/messages' },
    { label: 'Profile',   icon: '👤', path: '/profile' },
  ];

  const handleNav = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  // Dropdown rendered via portal to escape any stacking context
  const dropdown = open
    ? createPortal(
        <div
          id="burger-dropdown"
          style={{
            position: 'absolute',
            top: dropPos.top,
            right: dropPos.right,
            minWidth: '220px',
            background: '#1e293b',          // solid dark — NOT transparent
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
            padding: '8px',
            zIndex: 99999,
            animation: 'fadeSlideIn 0.18s ease',
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              id={`menu-${item.label.toLowerCase()}`}
              onClick={() => handleNav(item.path)}
              style={styles.menuItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,56,92,0.15)';
                e.currentTarget.style.color = '#ff385c';
                e.currentTarget.style.paddingLeft = '20px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#f8fafc';
                e.currentTarget.style.paddingLeft = '16px';
              }}
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <div style={styles.divider} />

          <button
            id="menu-logout"
            onClick={handleLogout}
            style={{ ...styles.menuItem, color: '#f87171' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(248,113,113,0.12)';
              e.currentTarget.style.paddingLeft = '20px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.paddingLeft = '16px';
            }}
          >
            <span style={styles.menuIcon}>⎋</span>
            <span>Logout</span>
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {/* inject animation keyframe once */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>

      {/* Trigger button */}
      <button
        ref={btnRef}
        id="burger-menu-btn"
        style={{
          ...styles.burgerBtn,
          background: open ? 'rgba(255,56,92,0.18)' : 'rgba(255,255,255,0.07)',
          borderColor: open ? '#ff385c' : 'rgba(255,255,255,0.18)',
        }}
        onClick={handleToggle}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <div style={styles.iconGroup}>
          <span style={{ ...styles.line, transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ ...styles.line, opacity: open ? 0 : 1 }} />
          <span style={{ ...styles.line, transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </div>
      </button>

      {dropdown}
    </>
  );
}

const styles = {
  burgerBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.18)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  iconGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    width: '18px',
  },
  line: {
    display: 'block',
    height: '2px',
    width: '100%',
    background: '#f8fafc',
    borderRadius: '2px',
    transition: 'transform 0.25s ease, opacity 0.2s ease',
    transformOrigin: 'left center',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: '#f8fafc',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s ease, color 0.15s ease, padding-left 0.15s ease',
  },
  menuIcon: {
    width: '22px',
    fontSize: '16px',
    textAlign: 'center',
    flexShrink: 0,
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    margin: '6px 8px',
  },
};
