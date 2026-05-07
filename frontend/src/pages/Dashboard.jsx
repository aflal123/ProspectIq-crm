import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

// ── SVG Icons ───────────────────────────────────────────────
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconTrendUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconDollar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconTarget = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

// ── Stat Card ───────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, delay }) => (
  <div style={{ ...styles.card, animationDelay: delay }}  className="stat-card">
    <div style={{ ...styles.cardIconWrap, background: color.bg, border: `1px solid ${color.border}` }}>
      <span style={{ color: color.icon }}>{icon}</span>
    </div>
    <div style={styles.cardBody}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={{ ...styles.cardValue, color: color.value || '#fff' }}>{value}</p>
      {sub && <p style={styles.cardSub}>{sub}</p>}
    </div>
  </div>
);

// ── Pipeline Bar ────────────────────────────────────────────
const PipelineBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={styles.pipelineRow}>
      <div style={styles.pipelineMeta}>
        <span style={styles.pipelineLabel}>{label}</span>
        <span style={styles.pipelineCount}>{count} <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500 }}>({pct}%)</span></span>
      </div>
      <div style={styles.pipelineTrack}>
        <div style={{ ...styles.pipelineFill, width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

// ── Component ───────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data.data);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fmt = (n) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
    return `$${n || 0}`;
  };

  const winRate = stats
    ? stats.totalLeads > 0
      ? Math.round((stats.wonLeads / stats.totalLeads) * 100)
      : 0
    : 0;

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.pageBody}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.greeting}>{getGreeting()}, {user.name?.split(' ')[0] || 'there'}</p>
            <h1 style={styles.pageTitle}>Sales Dashboard</h1>
            <p style={styles.pageSub}>Your pipeline at a glance</p>
          </div>
          <button
            onClick={() => navigate('/leads')}
            style={styles.addBtn}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.25)'; }}
          >
            <IconPlus /> Add Lead
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.centered}>
            <div style={styles.bigSpinner} />
            <p style={styles.loadingText}>Loading your pipeline...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Stats */}
        {stats && !loading && (
          <>
            {/* KPI Cards */}
            <div style={styles.cardsGrid}>
              <StatCard icon={<IconUsers />}   label="Total Leads"    value={stats.totalLeads}        sub="All time"             color={{ bg:'rgba(59,130,246,0.1)',  border:'rgba(59,130,246,0.2)',  icon:'#3b82f6', value:'#0f172a' }}    delay="0ms" />
              <StatCard icon={<IconStar />}    label="New Leads"      value={stats.newLeads}           sub="Awaiting contact"     color={{ bg:'rgba(168,85,247,0.1)', border:'rgba(168,85,247,0.2)', icon:'#a855f7', value:'#0f172a' }}    delay="60ms" />
              <StatCard icon={<IconTarget />}  label="Qualified"      value={stats.qualifiedLeads}     sub="Ready to pitch"       color={{ bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.2)', icon:'#f59e0b', value:'#0f172a' }}    delay="120ms" />
              <StatCard icon={<IconTrendUp />} label="Won Deals"      value={stats.wonLeads}           sub={`${winRate}% win rate`} color={{ bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.2)', icon:'#10b981', value:'#10b981' }} delay="180ms" />
              <StatCard icon={<IconX />}       label="Lost Deals"     value={stats.lostLeads}          sub="Closed lost"          color={{ bg:'rgba(239,68,68,0.1)',  border:'rgba(239,68,68,0.2)',  icon:'#ef4444', value:'#ef4444' }}  delay="240ms" />
              <StatCard icon={<IconDollar />}  label="Total Pipeline" value={fmt(stats.totalDealValue)} sub="Potential revenue"   color={{ bg:'rgba(59,130,246,0.1)',  border:'rgba(59,130,246,0.2)',  icon:'#3b82f6', value:'#0f172a' }}    delay="300ms" />
            </div>

            {/* Bottom section */}
            <div style={styles.bottomGrid}>
              {/* Pipeline breakdown */}
              <div style={styles.panel}>
                <div style={styles.panelHeader}>
                  <h2 style={styles.panelTitle}>Pipeline Breakdown</h2>
                  <span style={styles.panelSub}>{stats.totalLeads} total leads</span>
                </div>
                <div style={styles.pipelineList}>
                  <PipelineBar label="New"           count={stats.newLeads}       total={stats.totalLeads} color="linear-gradient(90deg,#6366f1,#8b5cf6)" />
                  <PipelineBar label="Contacted"     count={stats.contactedLeads  || 0} total={stats.totalLeads} color="linear-gradient(90deg,#3b82f6,#60a5fa)" />
                  <PipelineBar label="Qualified"     count={stats.qualifiedLeads} total={stats.totalLeads} color="linear-gradient(90deg,#f59e0b,#fbbf24)" />
                  <PipelineBar label="Proposal Sent" count={stats.proposalLeads   || 0} total={stats.totalLeads} color="linear-gradient(90deg,#06b6d4,#22d3ee)" />
                  <PipelineBar label="Won"           count={stats.wonLeads}       total={stats.totalLeads} color="linear-gradient(90deg,#10b981,#34d399)" />
                  <PipelineBar label="Lost"          count={stats.lostLeads}      total={stats.totalLeads} color="linear-gradient(90deg,#ef4444,#f87171)" />
                </div>
              </div>

              {/* Revenue snapshot */}
              <div style={styles.panel}>
                <div style={styles.panelHeader}>
                  <h2 style={styles.panelTitle}>Revenue Snapshot</h2>
                </div>
                <div style={styles.revenueList}>
                  {[
                    { label: 'Total Pipeline Value', value: fmt(stats.totalDealValue), color: '#60a5fa' },
                    { label: 'Won Revenue',          value: fmt(stats.wonDealValue),   color: '#34d399' },
                    { label: 'At Risk (Lost)',        value: fmt(stats.lostDealValue || 0), color: '#f87171' },
                    { label: 'Win Rate',             value: `${winRate}%`,             color: winRate >= 50 ? '#34d399' : '#fbbf24' },
                  ].map(row => (
                    <div key={row.label} style={styles.revenueRow}>
                      <span style={styles.revenueLabel}>{row.label}</span>
                      <span style={{ ...styles.revenueValue, color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate('/leads')}
                  style={styles.ctaBtn}
                  onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; }}
                >
                  View All Leads <IconArrow />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .stat-card { animation: fadeUp 0.4s ease both; }
      `}</style>
    </div>
  );
};

const styles = {
  page: { minHeight:'100vh', background:'#f8fafc', fontFamily:"'Inter', system-ui, sans-serif" },
  pageBody: { maxWidth:'1200px', margin:'0 auto', padding:'40px 24px' },
  header: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'36px', flexWrap:'wrap', gap:'16px' },
  greeting: { color:'#64748b', fontSize:'14px', marginBottom:'6px', fontWeight: 500 },
  pageTitle: { fontSize:'30px', fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.5px' },
  pageSub: { color:'#64748b', fontSize:'15px', marginTop:'4px' },
  addBtn: { display:'flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', border:'none', borderRadius:'10px', padding:'12px 20px', fontSize:'14px', fontWeight:600, cursor:'pointer', transition:'all 0.2s ease', boxShadow:'0 4px 12px rgba(59,130,246,0.25)', fontFamily:"'Inter', sans-serif" },
  cardsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'16px', marginBottom:'24px' },
  card: { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'16px', padding:'20px', display:'flex', flexDirection:'column', gap:'16px', transition:'border-color 0.2s, transform 0.2s, box-shadow 0.2s', cursor:'default', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' },
  cardIconWrap: { width:'44px', height:'44px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center' },
  cardBody: { display:'flex', flexDirection:'column', gap:'2px' },
  cardLabel: { fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.6px', margin:0 },
  cardValue: { fontSize:'28px', fontWeight:800, color:'#0f172a', margin:'4px 0 0 0', letterSpacing:'-0.5px' },
  cardSub: { fontSize:'12px', color:'#94a3b8', margin:0, fontWeight: 500 },
  bottomGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' },
  panel: { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'20px', padding:'28px', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' },
  panelHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' },
  panelTitle: { fontSize:'18px', fontWeight:700, color:'#0f172a', margin:0 },
  panelSub: { fontSize:'13px', color:'#64748b', fontWeight: 500 },
  pipelineList: { display:'flex', flexDirection:'column', gap:'14px' },
  pipelineRow: { display:'flex', flexDirection:'column', gap:'6px' },
  pipelineMeta: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  pipelineLabel: { fontSize:'13px', color:'#475569', fontWeight:600 },
  pipelineCount: { fontSize:'14px', color:'#0f172a', fontWeight:700 },
  pipelineTrack: { height:'8px', background:'#f1f5f9', borderRadius:'99px', overflow:'hidden' },
  pipelineFill: { height:'100%', borderRadius:'99px', transition:'width 0.8s ease' },
  revenueList: { display:'flex', flexDirection:'column', gap:'0' },
  revenueRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #f1f5f9' },
  revenueLabel: { fontSize:'14px', color:'#475569', fontWeight: 500 },
  revenueValue: { fontSize:'16px', fontWeight:700 },
  ctaBtn: { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', width:'100%', marginTop:'20px', background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#166534', borderRadius:'12px', padding:'12px', fontSize:'14px', fontWeight:600, cursor:'pointer', transition:'background 0.2s', fontFamily:"'Inter', sans-serif" },
  centered: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'300px', gap:'16px' },
  bigSpinner: { width:'40px', height:'40px', border:'3px solid #e2e8f0', borderTop:'3px solid #3b82f6', borderRadius:'50%', animation:'spin 0.9s linear infinite' },
  loadingText: { color:'#64748b', fontSize:'14px', fontWeight: 500 },
  errorBox: { background:'#fef2f2', border:'1px solid #fecaca', color:'#ef4444', borderRadius:'14px', padding:'16px 20px', fontSize:'14px', display:'flex', alignItems:'center', gap:'10px', fontWeight: 500 },
};

export default Dashboard;
