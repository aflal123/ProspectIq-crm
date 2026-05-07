import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

// ── Icons ─────────────────────────────────────────────────────
const IconBack  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></svg>;
const IconBot   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/><path d="M8 15h.01M12 15h.01M16 15h.01"/></svg>;
const IconSend  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconNote  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IconStar  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

const STATUS_COLORS = {
  new:           { bg:'#ede9fe', border:'#ddd6fe', text:'#7c3aed' },
  contacted:     { bg:'#dbeafe', border:'#bfdbfe', text:'#2563eb' },
  qualified:     { bg:'#fef3c7', border:'#fde68a', text:'#d97706' },
  proposal_sent: { bg:'#cffafe', border:'#a5f3fc', text:'#0891b2' },
  won:           { bg:'#d1fae5', border:'#a7f3d0', text:'#059669' },
  lost:          { bg:'#fee2e2', border:'#fecaca', text:'#dc2626' },
};

const STATUSES = ['new','contacted','qualified','proposal_sent','won','lost'];

// Score ring colour
const scoreColor = (s) => {
  if (s >= 75) return '#34d399';
  if (s >= 50) return '#fbbf24';
  return '#f87171';
};

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead,    setLead]    = useState(null);
  const [notes,   setNotes]   = useState([]);
  const [newNote, setNewNote] = useState('');
  const [ai,      setAi]      = useState(null);

  const [loadingLead,  setLoadingLead]  = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [addingNote,   setAddingNote]   = useState(false);
  const [scoringAI,    setScoringAI]    = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error,        setError]        = useState('');

  const notesEndRef = useRef(null);

  // ── Fetch lead ─────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/leads');
        const found = res.data.data.find(l => l.id === id);
        if (!found) { navigate('/leads'); return; }
        setLead(found);
        // If AI score already saved, show it
        if (found.ai_score) {
          setAi({ score: found.ai_score, reasoning: found.ai_reason, strengths:[], risks:[], recommendedAction:'' });
        }
      } catch { setError('Failed to load lead.'); }
      finally { setLoadingLead(false); }
    };
    fetch();
  }, [id, navigate]);

  // ── Fetch notes ────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNotes(res.data.data);
      } catch { /* silent */ }
      finally { setLoadingNotes(false); }
    };
    fetch();
  }, [id]);

  useEffect(() => { notesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [notes]);

  // ── Add note ───────────────────────────────────────────────
  const handleAddNote = async e => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await api.post(`/notes/${id}`, { content: newNote.trim() });
      const res = await api.get(`/notes/${id}`);
      setNotes(res.data.data);
      setNewNote('');
    } finally { setAddingNote(false); }
  };

  // ── Update status ──────────────────────────────────────────
  const handleStatusChange = async (status) => {
    setSavingStatus(true);
    try {
      await api.put(`/leads/${id}`, { status });
      setLead(prev => ({ ...prev, status }));
    } finally { setSavingStatus(false); }
  };

  // ── AI Score ───────────────────────────────────────────────
  const handleAIScore = async () => {
    setScoringAI(true);
    setAi(null);
    try {
      const res = await api.post(`/ai/score-lead/${id}`);
      setAi(res.data.aiScore);
    } catch { setError('AI scoring failed. Check your OpenAI key.'); }
    finally { setScoringAI(false); }
  };

  const fmt = n => n ? `LKR ${Number(n).toLocaleString()}` : '—';
  const timeAgo = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
    return new Date(d).toLocaleDateString();
  };

  if (loadingLead) return (
    <div style={styles.page}><Navbar />
      <div style={styles.centered}><div style={styles.spinner}/><p style={styles.loadTxt}>Loading lead...</p></div>
    </div>
  );

  if (!lead) return null;
  const sc = STATUS_COLORS[lead.status] || STATUS_COLORS.new;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* Back + header */}
        <div style={styles.topBar}>
          <button onClick={() => navigate('/leads')} style={styles.backBtn}><IconBack /> Back to Leads</button>
        </div>

        {error && <div style={styles.errBox}>{error}</div>}

        <div style={styles.grid}>
          {/* ── LEFT COLUMN ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Lead info card */}
            <div style={styles.panel}>
              <div style={styles.leadHeader}>
                <div style={styles.bigAvatar}>{lead.name?.[0]?.toUpperCase()}</div>
                <div>
                  <h1 style={styles.leadName}>{lead.name}</h1>
                  {lead.company_name && <p style={styles.leadCompany}>{lead.company_name}</p>}
                </div>
              </div>

              {/* Info grid */}
              <div style={styles.infoGrid}>
                {[
                  { label:'Email',      val: lead.email      || '—' },
                  { label:'Phone',      val: lead.phone      || '—' },
                  { label:'Source',     val: lead.lead_source?.replace('_',' ') || '—' },
                  { label:'Deal Value', val: fmt(lead.deal_value) },
                  { label:'Created',    val: new Date(lead.created_at).toLocaleDateString() },
                  { label:'Last Updated',val: new Date(lead.updated_at).toLocaleDateString() },
                  { label:'Assigned To',val: lead.users?.name || 'Sales Rep' },
                ].map(r => (
                  <div key={r.label} style={styles.infoRow}>
                    <span style={styles.infoLabel}>{r.label}</span>
                    <span style={styles.infoVal}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* Status selector */}
              <div style={{ marginTop:'20px' }}>
                <p style={styles.secLabel}>Status</p>
                <div style={styles.statusRow}>
                  {STATUSES.map(s => {
                    const c = STATUS_COLORS[s];
                    const active = lead.status === s;
                    return (
                      <button key={s} onClick={() => handleStatusChange(s)} disabled={savingStatus}
                        style={{ ...styles.statusBtn, background: active ? c.bg : '#ffffff', border: `1px solid ${active ? c.border : '#e2e8f0'}`, color: active ? c.text : '#64748b' }}>
                        {s.replace('_',' ')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Score card */}
            <div style={styles.panel}>
              <div style={styles.panelHead}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <IconBot />
                  <h2 style={styles.panelTitle}>AI Lead Score</h2>
                </div>
                <button onClick={handleAIScore} disabled={scoringAI} style={styles.aiBtn}
                  onMouseEnter={e => { if(!scoringAI) e.currentTarget.style.background='rgba(139,92,246,0.2)'; }}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(139,92,246,0.1)'}>
                  {scoringAI ? <><span style={styles.miniSpinner}/>Scoring...</> : <><IconBot /> Score with AI</>}
                </button>
              </div>

              {scoringAI && (
                <div style={styles.aiLoading}>
                  <div style={styles.spinner}/>
                  <p style={styles.loadTxt}>Analysing lead with GPT-4o mini...</p>
                </div>
              )}

              {ai && !scoringAI && (
                <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                  {/* Score ring */}
                  <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                    <div style={{ ...styles.scoreRing, borderColor: scoreColor(ai.score) }}>
                      <span style={{ fontSize:'26px', fontWeight:800, color: scoreColor(ai.score) }}>{ai.score}</span>
                      <span style={{ fontSize:'11px', color:'#94a3b8' }}>/100</span>
                    </div>
                    <div>
                      <p style={{ color:'#0f172a', fontSize:'15px', fontWeight:700, margin:'0 0 4px' }}>
                        {ai.score >= 75 ? '🔥 Hot Lead' : ai.score >= 50 ? '⚡ Warm Lead' : '❄️ Cold Lead'}
                      </p>
                      {ai.recommendedAction && (
                        <p style={{ color:'#64748b', fontSize:'13px', margin:0, fontWeight: 500 }}>{ai.recommendedAction}</p>
                      )}
                    </div>
                  </div>

                  {ai.reasoning && (
                    <p style={styles.reasoning}>{ai.reasoning}</p>
                  )}

                  {ai.strengths?.length > 0 && (
                    <div>
                      <p style={styles.secLabel}>Strengths</p>
                      {ai.strengths.map((s,i) => (
                        <div key={i} style={styles.aiPoint}>
                          <span style={{ color:'#10b981' }}><IconStar /></span>
                          <span style={{ color:'#475569', fontSize:'14px', fontWeight: 500 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {ai.risks?.length > 0 && (
                    <div>
                      <p style={styles.secLabel}>Risks</p>
                      {ai.risks.map((r,i) => (
                        <div key={i} style={styles.aiPoint}>
                          <span style={{ color:'#ef4444', fontSize:'12px' }}>▲</span>
                          <span style={{ color:'#475569', fontSize:'14px', fontWeight: 500 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!ai && !scoringAI && (
                <p style={{ color:'#94a3b8', fontSize:'14px', marginTop:'12px', fontWeight: 500 }}>
                  Click "Score with AI" to analyse this lead using GPT-4o mini.
                </p>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Notes ── */}
          <div style={styles.panel}>
            <div style={styles.panelHead}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <IconNote />
                <h2 style={styles.panelTitle}>Notes</h2>
              </div>
              <span style={styles.noteCount}>{notes.length} notes</span>
            </div>

            {/* Notes list */}
            <div style={styles.notesList}>
              {loadingNotes ? (
                <div style={styles.centered}><div style={styles.spinner}/></div>
              ) : notes.length === 0 ? (
                <div style={styles.emptyNotes}>
                  <IconNote />
                  <p>No notes yet. Add the first one below.</p>
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} style={styles.noteCard}>
                    <div style={styles.noteTop}>
                      <span style={styles.noteAuthor}>{note.users?.name || 'You'}</span>
                      <span style={styles.noteTime}>{timeAgo(note.created_at)}</span>
                    </div>
                    <p style={styles.noteContent}>{note.content}</p>
                  </div>
                ))
              )}
              <div ref={notesEndRef} />
            </div>

            {/* Add note form */}
            <form onSubmit={handleAddNote} style={styles.noteForm}>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a note — call outcome, next step, email sent..."
                rows={3}
                style={styles.noteInput}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAddNote(e); }}
              />
              <button type="submit" disabled={addingNote || !newNote.trim()} style={{ ...styles.sendBtn, opacity: addingNote || !newNote.trim() ? 0.5 : 1 }}>
                {addingNote ? 'Adding...' : <><IconSend /> Add Note</>}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to{transform:rotate(360deg)} }
        textarea::placeholder { color:#94a3b8; }
        textarea:focus { outline:none; border-color:#3b82f6 !important; box-shadow:0 0 0 2px rgba(59,130,246,0.1); }
      `}</style>
    </div>
  );
};

const styles = {
  page:       { minHeight:'100vh', background:'#f8fafc', fontFamily:"'Inter',system-ui,sans-serif" },
  body:       { maxWidth:'1200px', margin:'0 auto', padding:'32px 24px' },
  topBar:     { marginBottom:'24px' },
  backBtn:    { display:'flex', alignItems:'center', gap:'8px', background:'#ffffff', border:'1px solid #e2e8f0', color:'#475569', borderRadius:'10px', padding:'8px 14px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s', boxShadow:'0 1px 2px rgba(0,0,0,0.05)' },
  errBox:     { background:'#fef2f2', border:'1px solid #fecaca', color:'#ef4444', borderRadius:'12px', padding:'14px 18px', fontSize:'14px', marginBottom:'20px', fontWeight: 500 },
  grid:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' },
  panel:      { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'20px', padding:'28px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)' },
  leadHeader: { display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px' },
  bigAvatar:  { width:'56px', height:'56px', borderRadius:'16px', background:'linear-gradient(135deg,#2563eb,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:800, color:'#fff', flexShrink:0, boxShadow:'0 4px 12px rgba(37,99,235,0.25)' },
  leadName:   { fontSize:'24px', fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.3px' },
  leadCompany:{ color:'#64748b', fontSize:'15px', margin:'4px 0 0', fontWeight: 500 },
  infoGrid:   { display:'flex', flexDirection:'column', gap:'0' },
  infoRow:    { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid #f1f5f9' },
  infoLabel:  { fontSize:'13px', color:'#64748b', fontWeight:600 },
  infoVal:    { fontSize:'14px', color:'#0f172a', fontWeight:700 },
  secLabel:   { fontSize:'12px', fontWeight:700, color:'#475569', letterSpacing:'0.6px', textTransform:'uppercase', margin:'0 0 10px' },
  statusRow:  { display:'flex', flexWrap:'wrap', gap:'8px' },
  statusBtn:  { borderRadius:'8px', padding:'8px 14px', fontSize:'13px', fontWeight:600, cursor:'pointer', textTransform:'capitalize', fontFamily:"'Inter',sans-serif", transition:'all 0.15s', boxShadow:'0 1px 2px rgba(0,0,0,0.02)' },
  panelHead:  { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  panelTitle: { fontSize:'18px', fontWeight:800, color:'#0f172a', margin:0 },
  aiBtn:      { display:'flex', alignItems:'center', gap:'6px', background:'#f3e8ff', border:'1px solid #e9d5ff', color:'#7e22ce', borderRadius:'10px', padding:'8px 14px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s', boxShadow:'0 1px 2px rgba(0,0,0,0.05)' },
  aiLoading:  { display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', padding:'24px 0' },
  scoreRing:  { width:'76px', height:'76px', borderRadius:'50%', border:'4px solid', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 },
  reasoning:  { background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'16px', fontSize:'14px', color:'#334155', lineHeight:'1.7', fontWeight: 500 },
  aiPoint:    { display:'flex', alignItems:'flex-start', gap:'8px', marginBottom:'8px' },
  noteCount:  { background:'#f1f5f9', borderRadius:'20px', padding:'4px 12px', fontSize:'12px', color:'#475569', fontWeight:700 },
  notesList:  { display:'flex', flexDirection:'column', gap:'12px', maxHeight:'380px', overflowY:'auto', marginBottom:'16px', paddingRight:'8px' },
  noteCard:   { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  noteTop:    { display:'flex', justifyContent:'space-between', marginBottom:'8px' },
  noteAuthor: { fontSize:'13px', fontWeight:700, color:'#2563eb' },
  noteTime:   { fontSize:'12px', color:'#94a3b8', fontWeight: 500 },
  noteContent:{ fontSize:'14px', color:'#334155', lineHeight:'1.7', margin:0, fontWeight: 500 },
  emptyNotes: { display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', padding:'40px 0', color:'#94a3b8', fontSize:'14px', fontWeight: 500 },
  noteForm:   { display:'flex', flexDirection:'column', gap:'12px', borderTop:'1px solid #e2e8f0', paddingTop:'20px' },
  noteInput:  { background:'#ffffff', border:'1px solid #cbd5e1', borderRadius:'12px', padding:'14px', color:'#0f172a', fontSize:'14px', resize:'vertical', fontFamily:"'Inter',sans-serif", lineHeight:'1.6', transition:'border-color 0.2s', outline:'none' },
  sendBtn:    { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'linear-gradient(135deg,#2563eb,#4f46e5)', border:'none', color:'#fff', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", boxShadow:'0 4px 12px rgba(59,130,246,0.25)' },
  centered:   { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'200px', gap:'14px' },
  spinner:    { width:'36px', height:'36px', border:'3px solid #e2e8f0', borderTop:'3px solid #3b82f6', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  miniSpinner:{ width:'14px', height:'14px', border:'2px solid rgba(59,130,246,0.3)', borderTop:'2px solid #3b82f6', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite', marginRight:'6px' },
  loadTxt:    { color:'#64748b', fontSize:'14px', fontWeight: 500 },
};

export default LeadDetail;
