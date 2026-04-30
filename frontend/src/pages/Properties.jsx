import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const EMPTY_FILTERS = {
  location: '',
  minPrice: '',
  maxPrice: '',
  guests: '',
  checkInDate: '',
  checkOutDate: '',
  sort: 'newest',
};

export default function Properties({ role, username, onLogout }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const navigate = useNavigate();

  const search = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.location.trim()) params.location = filters.location.trim();
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.guests) params.guests = filters.guests;
    if (filters.checkInDate) params.checkInDate = filters.checkInDate;
    if (filters.checkOutDate) params.checkOutDate = filters.checkOutDate;
    params.sort = filters.sort;

    api.get('/properties/search', { params })
      .then(r => setProperties(r.data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { search(); }, []);

  const set = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));
  const activeFilters = Object.entries(filters)
    .filter(([key, value]) => key !== 'sort' && String(value).trim())
    .map(([key, value]) => `${key}: ${value}`);

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setLoading(true);
    api.get('/properties/search', { params: { sort: 'newest' } })
      .then(r => setProperties(r.data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
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

      <h1 style={s.title}>Find Your Stay</h1>

      {/* Filter Panel */}
      <div className="glass-panel" style={s.filterPanel}>
        <div style={s.filterGrid}>
          <div style={s.field}>
            <label style={s.label}>Location</label>
            <input
              type="text"
              placeholder="e.g. Goa, Mumbai…"
              value={filters.location}
              onChange={e => set('location', e.target.value)}
              style={s.input}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Min Price / night ($)</label>
            <input type="number" min="0" value={filters.minPrice} onChange={e => set('minPrice', e.target.value)} style={s.input} placeholder="0" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Max Price / night ($)</label>
            <input type="number" min="0" value={filters.maxPrice} onChange={e => set('maxPrice', e.target.value)} style={s.input} placeholder="Any" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Min Guests</label>
            <input type="number" min="1" value={filters.guests} onChange={e => set('guests', e.target.value)} style={s.input} placeholder="1" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Check-In</label>
            <input type="date" value={filters.checkInDate} onChange={e => set('checkInDate', e.target.value)} style={s.input} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Check-Out</label>
            <input type="date" value={filters.checkOutDate} onChange={e => set('checkOutDate', e.target.value)} style={s.input} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Sort By</label>
            <select value={filters.sort} onChange={e => set('sort', e.target.value)} style={{...s.input, cursor: 'pointer'}}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div style={s.filterActions}>
          <button className="btn-primary" onClick={search} style={{padding: '10px 32px'}}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button onClick={clearFilters} style={s.clearBtn}>Clear Filters</button>
        </div>
        {activeFilters.length > 0 && (
          <div style={s.chips}>
            {activeFilters.map(chip => <span key={chip} style={s.chip}>{chip}</span>)}
          </div>
        )}
      </div>

      {/* Results */}
      <div style={s.results}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h2 style={{margin: 0, fontSize: '20px'}}>
            {loading ? 'Searching...' : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} found`}
          </h2>
        </div>

        {loading && (
          <div style={s.grid}>
            {[1, 2, 3, 4].map(item => <div key={item} className="glass-panel" style={s.skeletonCard} />)}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="glass-panel" style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
            No properties match your filters. Try broadening your search.
          </div>
        )}

        {!loading && <div style={s.grid}>
          {properties.map(p => (
            <div
              key={p.id}
              className="glass-panel"
              style={s.card}
              onClick={() => navigate(`/properties/${p.id}`, { state: { property: p } })}
            >
              <div style={s.img} />
              <div style={s.info}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <h3 style={{fontSize: '15px', margin: 0, flex: 1}}>{p.title}</h3>
                  {p.reviewSummary?.reviewCount > 0 && (
                    <span style={{fontSize: '13px', flexShrink: 0, marginLeft: '8px'}}>
                      ★ {p.reviewSummary.averageRating.toFixed(1)}
                      <span style={{color: 'var(--text-muted)', fontSize: '12px'}}> ({p.reviewSummary.reviewCount})</span>
                    </span>
                  )}
                </div>
                <p style={{color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0'}}>{p.location}</p>
                {p.description && (
                  <p style={{color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0', lineHeight: '1.4'}}>
                    {p.description.length > 80 ? p.description.slice(0, 80) + '…' : p.description}
                  </p>
                )}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px'}}>
                  <p style={{margin: 0, fontWeight: 700, fontSize: '15px'}}>
                    ${p.pricePerNight}
                    <span style={{fontWeight: 400, color: 'var(--text-muted)', fontSize: '13px'}}> / night</span>
                  </p>
                  <span style={{color: 'var(--text-muted)', fontSize: '12px'}}>Up to {p.maxGuests} guests</span>
                </div>
                {role === 'USER' && (
                  <button
                    className="btn-primary"
                    style={{marginTop: '12px', width: '100%', padding: '8px', fontSize: '13px'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/properties/${p.id}`, { state: { property: p } });
                    }}
                  >
                    View & Book
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}

const s = {
  page: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', marginBottom: '32px' },
  brand: { fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', fontSize: '16px' },
  logoutBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 },
  title: { fontSize: '32px', fontWeight: 800, marginBottom: '24px' },
  filterPanel: { padding: '20px 24px', marginBottom: '32px' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontSize: '14px' },
  filterActions: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', flexWrap: 'wrap' },
  clearBtn: { background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 },
  chips: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' },
  chip: { padding: '5px 10px', borderRadius: '999px', background: 'rgba(255,56,92,0.12)', color: '#fb7185', fontSize: '12px', fontWeight: 700 },
  results: { },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  card: { overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' },
  img: { height: '200px', backgroundImage: 'url(https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' },
  info: { padding: '14px' },
  skeletonCard: { height: '310px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.09), rgba(255,255,255,0.04))' },
};
