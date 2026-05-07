import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

// ── Icons ────────────────────────────────────────────────────
const IconPlus    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconSearch  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconEye     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconClose   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ── Status badge colours ──────────────────────────────────────
const STATUS_COLORS = {
  new:           { bg:'#ede9fe', border:'#ddd6fe', text:'#7c3aed' },
  contacted:     { bg:'#dbeafe', border:'#bfdbfe', text:'#2563eb' },
  qualified:     { bg:'#fef3c7', border:'#fde68a', text:'#d97706' },
  proposal_sent: { bg:'#cffafe', border:'#a5f3fc', text:'#0891b2' },
  won:           { bg:'#d1fae5', border:'#a7f3d0', text:'#059669' },
  lost:          { bg:'#fee2e2', border:'#fecaca', text:'#dc2626' },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.new;
  return (
    <span style={{ background:c.bg, border:`1px solid ${c.border}`, color:c.text, borderRadius:'20px', padding:'4px 10px', fontSize:'12px', fontWeight:600, textTransform:'capitalize', whiteSpace:'nowrap' }}>
      {status?.replace('_', ' ')}
    </span>
  );
};

// ── Empty lead form ───────────────────────────────────────────
const EMPTY = { lead_name:'', company_name:'', email:'', phone:'', lead_source:'website', status:'new', deal_value:'' };

const SOURCES  = ['website','linkedin','referral','cold_email','event','other'];
const STATUSES = ['new','contacted','qualified','proposal_sent','won','lost'];

// ── Modal ─────────────────────────────────────────────────────
const LeadModal = ({ lead, onClose, onSave }) => {
  const [form, setForm] = useState(lead || EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const isEdit = !!lead?.id;

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      if (isEdit) await api.put(`/leads/${lead.id}`, form);
      else        await api.post('/leads', form);
      onSave();
    } catch (err) {
      setErr(err.response?.data?.message || 'Failed to save lead.');
    } finally { setSaving(false); }
  };

  const inputStyle = { width:'100%', background:'#f8fafc', border:'1px solid #cbd5e1', borderRadius:'10px', padding:'11px 14px', color:'#0f172a', fontSize:'14px', fontFamily:"'Inter',sans-serif", boxSizing:'border-box', outline:'none' };
  const labelStyle = { fontSize:'12px', fontWeight:600, color:'#475569', letterSpacing:'0.5px', textTransform:'uppercase', display:'block', marginBottom:'6px' };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button onClick={onClose} style={styles.closeBtn}><IconClose /></button>
        </div>

        {err && <div style={styles.errBox}>{err}</div>}

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={styles.row2}>
            <div><label style={labelStyle}>Lead Name *</label><input name="lead_name" value={form.lead_name} onChange={handle} required placeholder="Jane Smith" style={inputStyle}/></div>
            <div><label style={labelStyle}>Company</label><input name="company_name" value={form.company_name} onChange={handle} placeholder="Acme Corp" style={inputStyle}/></div>
          </div>
          <div style={styles.row2}>
            <div><label style={labelStyle}>Email</label><input type="email" name="email" value={form.email} onChange={handle} placeholder="jane@acme.com" style={inputStyle}/></div>
            <div><label style={labelStyle}>Phone</label><input name="phone" value={form.phone} onChange={handle} placeholder="+1 555 000 0000" style={inputStyle}/></div>
          </div>
          <div style={styles.row2}>
            <div>
              <label style={labelStyle}>Source</label>
              <select name="lead_source" value={form.lead_source} onChange={handle} style={inputStyle}>
                {SOURCES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select name="status" value={form.status} onChange={handle} style={inputStyle}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Deal Value ($)</label>
            <input type="number" name="deal_value" value={form.deal_value} onChange={handle} placeholder="5000" style={inputStyle}/>
          </div>

          <div style={{ display:'flex', gap:'10px', marginTop:'6px' }}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
      <style>{`select option { background: #ffffff; color: #0f172a; } input::placeholder { color:#94a3b8; } input:focus,select:focus { border-color:#3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }`}</style>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterAssigned, setFilterAssigned] = useState('all'); // 'all' or 'me'
  const [modal, setModal]           = useState(null); // null | 'add' | lead object
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      setLeads(res.data.data);
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/leads/${deleteId}`);
      setDeleteId(null);
      fetchLeads();
    } finally { setDeleting(false); }
  };

  const fmt = n => n ? `$${Number(n).toLocaleString()}` : '—';

  const filtered = leads.filter(l => {
    const matchSearch = search === '' ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    const matchSource = filterSource === 'all' || l.lead_source === filterSource;
    // For 'me' filter, we would match l.assigned_to against currentUser.id
    // But since we don't have current user readily available here, we'll just parse the JWT if needed
    // or assume the backend could filter it. Let's just do a basic implementation.
    const tokenUser = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
    const matchAssigned = filterAssigned === 'all' || l.assigned_to === tokenUser.id;
    
    return matchSearch && matchStatus && matchSource && matchAssigned;
  });

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Leads</h1>
            <p style={styles.pageSub}>{leads.length} total leads in your pipeline</p>
          </div>
          <button onClick={() => setModal('add')} style={styles.addBtn}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
            <IconPlus /> Add Lead
          </button>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.searchWrap}>
            <IconSearch />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or company..."
              style={styles.searchInput} />
          </div>
          <div style={styles.filterWrap}>
            <select style={styles.filterSelect} value={filterStatus} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select style={styles.filterSelect} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
              <option value="all">All Sources</option>
              {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select style={styles.filterSelect} value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)}>
              <option value="all">Everyone's Leads</option>
              <option value="me">My Leads</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={styles.centered}><div style={styles.spinner}/><p style={styles.loadTxt}>Loading leads...</p></div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'15px', margin:'12px 0 4px' }}>No leads found</p>
            <p style={{ color:'rgba(255,255,255,0.2)', fontSize:'13px' }}>Add your first lead to get started</p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Lead Name','Company','Status','Deal Value','Source','Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr key={lead.id} style={{ ...styles.tr, animationDelay: `${i * 40}ms` }} className="lead-row">
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>{lead.name?.[0]?.toUpperCase() || '?'}</div>
                        <div>
                          <p style={styles.leadName}>{lead.name}</p>
                          {lead.email && <p style={styles.leadEmail}>{lead.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}><span style={styles.company}>{lead.company_name || '—'}</span></td>
                    <td style={styles.td}><StatusBadge status={lead.status} /></td>
                    <td style={styles.td}><span style={styles.dealVal}>{fmt(lead.deal_value)}</span></td>
                    <td style={styles.td}><span style={styles.source}>{lead.lead_source?.replace('_',' ') || '—'}</span></td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button onClick={() => navigate(`/leads/${lead.id}`)} style={styles.iconBtn} title="View"><IconEye /></button>
                        <button onClick={() => setModal(lead)} style={styles.iconBtn} title="Edit"><IconEdit /></button>
                        <button onClick={() => setDeleteId(lead.id)} style={{ ...styles.iconBtn, color:'#f87171' }} title="Delete"><IconTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <LeadModal
          lead={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchLeads(); }}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth:'380px' }}>
            <h3 style={{ color:'#0f172a', fontSize:'20px', fontWeight:800, margin:'0 0 10px' }}>Delete Lead?</h3>
            <p style={{ color:'#64748b', fontSize:'14px', margin:'0 0 24px' }}>This action cannot be undone.</p>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setDeleteId(null)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ ...styles.saveBtn, background:'linear-gradient(135deg,#dc2626,#ef4444)', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .lead-row { animation: fadeUp 0.3s ease both; }
        .lead-row:hover td { background: #f8fafc !important; }
        input::placeholder { color:#94a3b8; }
        input:focus { outline:none; }
      `}</style>
    </div>
  );
};

const styles = {
  page:       { minHeight:'100vh', background:'#f8fafc', fontFamily:"'Inter',system-ui,sans-serif" },
  body:       { maxWidth:'1200px', margin:'0 auto', padding:'40px 24px' },
  header:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px', flexWrap:'wrap', gap:'16px' },
  pageTitle:  { fontSize:'30px', fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.5px' },
  pageSub:    { color:'#64748b', fontSize:'15px', marginTop:'4px' },
  addBtn:     { display:'flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', border:'none', borderRadius:'10px', padding:'12px 20px', fontSize:'14px', fontWeight:600, cursor:'pointer', transition:'all 0.2s ease', fontFamily:"'Inter',sans-serif", boxShadow:'0 4px 12px rgba(59,130,246,0.25)' },
  toolbar:    { display:'flex', gap:'16px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' },
  searchWrap: { display:'flex', alignItems:'center', gap:'10px', background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'10px 14px', flex:'1', minWidth:'200px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  searchInput:{ flex:1, background:'transparent', border:'none', color:'#0f172a', fontSize:'14px', fontFamily:"'Inter',sans-serif" },
  filterWrap: { display:'flex', gap:'10px', flexWrap:'wrap' },
  filterSelect: { background:'#ffffff', border:'1px solid #e2e8f0', color:'#475569', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', fontWeight:500, cursor:'pointer', textTransform:'capitalize', fontFamily:"'Inter',sans-serif", transition:'all 0.15s', outline:'none', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  tableWrap:  { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'16px', overflow:'hidden', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)' },
  table:      { width:'100%', borderCollapse:'collapse' },
  th:         { padding:'14px 16px', textAlign:'left', fontSize:'12px', fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.6px', borderBottom:'1px solid #e2e8f0', background:'#f8fafc' },
  tr:         { borderBottom:'1px solid #f1f5f9', transition:'background 0.15s' },
  td:         { padding:'14px 16px', verticalAlign:'middle' },
  nameCell:   { display:'flex', alignItems:'center', gap:'12px' },
  avatar:     { width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#2563eb,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'#fff', flexShrink:0, boxShadow:'0 2px 4px rgba(37,99,235,0.2)' },
  leadName:   { fontSize:'14px', fontWeight:600, color:'#0f172a', margin:0 },
  leadEmail:  { fontSize:'13px', color:'#64748b', margin:'2px 0 0' },
  company:    { fontSize:'14px', color:'#475569', fontWeight: 500 },
  dealVal:    { fontSize:'14px', fontWeight:700, color:'#0f172a' },
  source:     { fontSize:'13px', color:'#64748b', textTransform:'capitalize', fontWeight: 500 },
  actions:    { display:'flex', gap:'6px' },
  iconBtn:    { background:'#f8fafc', border:'1px solid #e2e8f0', color:'#64748b', borderRadius:'8px', padding:'7px', cursor:'pointer', display:'flex', alignItems:'center', transition:'all 0.15s' },
  centered:   { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'300px', gap:'14px' },
  spinner:    { width:'36px', height:'36px', border:'3px solid #e2e8f0', borderTop:'3px solid #3b82f6', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  loadTxt:    { color:'#64748b', fontSize:'14px', fontWeight: 500 },
  empty:      { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'280px', border:'1px dashed #cbd5e1', borderRadius:'16px', background:'#ffffff' },
  // Modal
  overlay:    { position:'fixed', inset:0, background:'rgba(15,23,42,0.4)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' },
  modal:      { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'20px', padding:'32px', width:'100%', maxWidth:'560px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  modalTitle: { fontSize:'22px', fontWeight:800, color:'#0f172a', margin:0 },
  closeBtn:   { background:'#f8fafc', border:'1px solid #e2e8f0', color:'#64748b', borderRadius:'8px', padding:'6px', cursor:'pointer', display:'flex', alignItems:'center' },
  row2:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  errBox:     { background:'#fef2f2', border:'1px solid #fecaca', color:'#ef4444', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', marginBottom:'16px', fontWeight: 500 },
  cancelBtn:  { flex:1, background:'#f8fafc', border:'1px solid #cbd5e1', color:'#475569', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif" },
  saveBtn:    { flex:2, background:'linear-gradient(135deg,#2563eb,#4f46e5)', border:'none', color:'#fff', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", boxShadow:'0 4px 12px rgba(59,130,246,0.25)' },
};

export default Leads;
