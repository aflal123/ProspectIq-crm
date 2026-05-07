import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Target, Mail, BarChart3, Smile, Briefcase, Flame, RefreshCw, Lightbulb, Phone, Shield, CheckCircle, FileText, Clipboard, AlertTriangle } from 'lucide-react';

const TONES = ['friendly','formal','urgent','followup'];

const AIHub = () => {
  const [tab, setTab]         = useState('coach');
  const [leads, setLeads]     = useState([]);
  const [leadId, setLeadId]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  // Email composer state
  const [tone, setTone]       = useState('friendly');
  // Sales coach state
  const [question, setQuestion] = useState('');
  // Pipeline state
  const [report, setReport]   = useState(null);

  useEffect(() => {
    api.get('/leads').then(r => setLeads(r.data.data)).catch(() => {});
  }, []);

  const run = async () => {
    setLoading(true); setResult(null); setError('');
    try {
      if (tab === 'coach') {
        if (!leadId || !question.trim()) { setError('Select a lead and enter your question.'); setLoading(false); return; }
        const r = await api.post('/ai/sales-coach', { leadId, question });
        setResult(r.data.coaching);
      } else if (tab === 'email') {
        if (!leadId) { setError('Select a lead first.'); setLoading(false); return; }
        const r = await api.post('/ai/compose-email', { leadId, tone });
        setResult(r.data.email);
      } else {
        const r = await api.post('/ai/pipeline-health');
        setReport(r.data.report);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'AI request failed.');
    } finally { setLoading(false); }
  };

  const inp = { background:'#ffffff', border:'1px solid #cbd5e1', borderRadius:'10px', padding:'11px 14px', color:'#0f172a', fontSize:'14px', fontFamily:"'Inter',sans-serif", width:'100%', boxSizing:'border-box', outline:'none' };
  const sel = { ...inp, cursor:'pointer' };

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.body}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>AI Hub</h1>
            <p style={S.sub}>Powered by GPT-4o mini — your intelligent sales assistant</p>
          </div>
          <div style={S.aiBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/><path d="M8 15h.01M12 15h.01M16 15h.01"/></svg>
            GPT-4o mini
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {[
            { id:'coach', icon:<Target size={16} />, label:'Sales Coach' },
            { id:'email', icon:<Mail size={16} />, label:'Email Composer' },
            { id:'pipeline', icon:<BarChart3 size={16} />, label:'Pipeline Health' },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setResult(null); setReport(null); setError(''); }}
              style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}>
              <span style={{ display:'flex' }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div style={S.grid}>
          {/* ── INPUT PANEL ── */}
          <div style={S.panel}>
            {/* Sales Coach */}
            {tab === 'coach' && (
              <>
                <h2 style={S.panelTitle}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:'8px', color:'#2563eb'}}><Target size={22}/> AI Sales Coach</span>
                </h2>
                <p style={S.panelSub}>Pick a lead and ask anything — get a call script, objection handlers, and your next step.</p>
                <div style={S.field}>
                  <label style={S.label}>Select Lead</label>
                  <select value={leadId} onChange={e => setLeadId(e.target.value)} style={sel}>
                    <option value="">-- Choose a lead --</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.lead_name} — {l.company_name || 'No company'}</option>)}
                  </select>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Your Question</label>
                  <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={4}
                    placeholder="e.g. I'm about to call this lead. She went cold 2 weeks ago. How do I re-engage her?"
                    style={{ ...inp, resize:'vertical', lineHeight:'1.6' }} />
                </div>
                <div style={S.examples}>
                  <p style={S.exTitle}>Quick prompts:</p>
                  {['How do I open this call?', 'They said the price is too high. How do I handle this?', 'They stopped replying. How do I re-engage?'].map(q => (
                    <button key={q} onClick={() => setQuestion(q)} style={S.chip}>{q}</button>
                  ))}
                </div>
              </>
            )}

            {/* Email Composer */}
            {tab === 'email' && (
              <>
                <h2 style={S.panelTitle}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:'8px', color:'#8b5cf6'}}><Mail size={22}/> AI Email Composer</span>
                </h2>
                <p style={S.panelSub}>Pick a lead and a tone — AI writes a fully personalized sales email in seconds.</p>
                <div style={S.field}>
                  <label style={S.label}>Select Lead</label>
                  <select value={leadId} onChange={e => setLeadId(e.target.value)} style={sel}>
                    <option value="">-- Choose a lead --</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.lead_name} — {l.company_name || 'No company'}</option>)}
                  </select>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Email Tone</label>
                  <div style={S.toneRow}>
                    {TONES.map(t => (
                      <button key={t} onClick={() => setTone(t)} style={{ ...S.toneBtn, ...(tone === t ? S.toneBtnActive : {}) }}>
                        {t === 'friendly' ? <Smile size={16}/> : t === 'formal' ? <Briefcase size={16}/> : t === 'urgent' ? <Flame size={16}/> : <RefreshCw size={16}/>} {t}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Pipeline Health */}
            {tab === 'pipeline' && (
              <>
                <h2 style={S.panelTitle}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:'8px', color:'#059669'}}><BarChart3 size={22}/> Pipeline Health Report</span>
                </h2>
                <p style={S.panelSub}>AI analyses your entire pipeline and gives you a health score, priorities, at-risk deals, and revenue forecast.</p>
                <div style={S.infoBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Analyses all {leads.length} leads in your pipeline. Takes ~5 seconds.
                </div>
              </>
            )}

            {error && <div style={S.errBox}>{error}</div>}

            <button onClick={run} disabled={loading} style={{ ...S.runBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? <><span style={S.spinner} /> Thinking...</> : <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {tab === 'coach' ? 'Get Coaching' : tab === 'email' ? 'Compose Email' : 'Analyse Pipeline'}
              </>}
            </button>
          </div>

          {/* ── OUTPUT PANEL ── */}
          <div style={S.panel}>
            <h2 style={S.panelTitle}>
              {loading ? 'AI is thinking...' : result || report ? 'AI Response' : 'Results will appear here'}
            </h2>

            {loading && (
              <div style={S.loadingWrap}>
                <div style={S.bigSpinner}/>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'14px' }}>
                  {tab === 'coach' ? 'Crafting your coaching plan...' : tab === 'email' ? 'Writing your personalized email...' : 'Analysing your pipeline...'}
                </p>
              </div>
            )}

            {/* Sales Coach Result */}
            {result && tab === 'coach' && !loading && (
              <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                <div style={S.resultBlock}>
                  <p style={S.resultLabel}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}><Lightbulb size={16}/> Advice</span></p>
                  <p style={S.resultText}>{result.advice}</p>
                </div>
                <div style={S.resultBlock}>
                  <p style={S.resultLabel}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}><Phone size={16}/> Call Script</span></p>
                  <div style={S.scriptBox}>{result.callScript}</div>
                </div>
                <div style={S.resultBlock}>
                  <p style={S.resultLabel}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}><Shield size={16}/> Objection Handlers</span></p>
                  {result.objections?.map((o, i) => (
                    <div key={i} style={S.objRow}>
                      <span style={S.objNum}>{i+1}</span>
                      <span style={S.objText}>{o}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...S.resultBlock, background:'#ecfdf5', border:'1px solid #a7f3d0' }}>
                  <p style={{ ...S.resultLabel, color:'#059669' }}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}><CheckCircle size={16}/> Next Step</span></p>
                  <p style={S.resultText}>{result.nextStep}</p>
                </div>
              </div>
            )}

            {/* Email Composer Result */}
            {result && tab === 'email' && !loading && (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={S.resultBlock}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                    <p style={S.resultLabel}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}><Mail size={16}/> Subject Line</span></p>
                    <button onClick={() => navigator.clipboard.writeText(result.subject)} style={S.copyBtn}>Copy</button>
                  </div>
                  <div style={S.scriptBox}>{result.subject}</div>
                </div>
                <div style={S.resultBlock}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                    <p style={S.resultLabel}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}><FileText size={16}/> Email Body</span></p>
                    <button onClick={() => navigator.clipboard.writeText(result.body)} style={S.copyBtn}>Copy</button>
                  </div>
                  <div style={{ ...S.scriptBox, whiteSpace:'pre-line', maxHeight:'280px', overflowY:'auto' }}>{result.body}</div>
                </div>
                <div style={{ ...S.resultBlock, background:'#eff6ff', border:'1px solid #bfdbfe' }}>
                  <p style={{ ...S.resultLabel, color:'#2563eb' }}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}><Target size={16}/> Call To Action</span></p>
                  <p style={S.resultText}>{result.callToAction}</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`)} style={S.copyAllBtn}>
                  <Clipboard size={16} style={{display:'inline-block', verticalAlign:'middle'}}/> Copy Full Email
                </button>
              </div>
            )}

            {/* Pipeline Health Result */}
            {report && tab === 'pipeline' && !loading && (
              <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                {/* Health Score */}
                <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                  <div style={{ ...S.scoreRing, borderColor: report.healthScore >= 70 ? '#34d399' : report.healthScore >= 40 ? '#fbbf24' : '#f87171' }}>
                    <span style={{ fontSize:'26px', fontWeight:800, color: report.healthScore >= 70 ? '#34d399' : report.healthScore >= 40 ? '#fbbf24' : '#f87171' }}>{report.healthScore}</span>
                    <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>/100</span>
                  </div>
                  <div>
                    <p style={{ color:'#0f172a', fontWeight:700, fontSize:'16px', margin:'0 0 4px' }}>Pipeline Health Score</p>
                    <p style={{ color:'#64748b', fontSize:'14px', margin:0, lineHeight:'1.6' }}>{report.summary}</p>
                  </div>
                </div>
                <div style={S.resultBlock}>
                  <p style={S.resultLabel}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}><Target size={16}/> Forecast</span></p>
                  <p style={{ ...S.resultText, fontSize:'22px', fontWeight:800, color:'#059669' }}>{report.forecast}</p>
                </div>
                {report.priorities?.length > 0 && (
                  <div style={S.resultBlock}>
                    <p style={S.resultLabel}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}><Flame size={16}/> Top Priorities</span></p>
                    {report.priorities.map((p,i) => <div key={i} style={S.objRow}><span style={S.objNum}>{i+1}</span><span style={S.objText}>{p}</span></div>)}
                  </div>
                )}
                {report.atRisk?.length > 0 && (
                  <div style={{ ...S.resultBlock, background:'#fef2f2', border:'1px solid #fecaca' }}>
                    <p style={{ ...S.resultLabel, color:'#dc2626' }}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}><AlertTriangle size={16}/> At Risk</span></p>
                    {report.atRisk.map((r,i) => <p key={i} style={{ ...S.resultText, marginBottom:'6px', color:'#b91c1c' }}>• {r}</p>)}
                  </div>
                )}
                {report.recommendations?.length > 0 && (
                  <div style={S.resultBlock}>
                    <p style={S.resultLabel}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}><Lightbulb size={16}/> Recommendations</span></p>
                    {report.recommendations.map((r,i) => <div key={i} style={S.objRow}><span style={S.objNum}>{i+1}</span><span style={S.objText}>{r}</span></div>)}
                  </div>
                )}
              </div>
            )}

            {!result && !report && !loading && (
              <div style={S.emptyOut}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/></svg>
                <p style={{ color:'rgba(255,255,255,0.2)', fontSize:'14px', marginTop:'12px' }}>Configure your request on the left and click run</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to{transform:rotate(360deg)} }
        select option { background:#ffffff; color:#0f172a; }
        textarea::placeholder,input::placeholder { color:#94a3b8; }
        textarea:focus,select:focus,input:focus { outline:none; border-color:#3b82f6 !important; box-shadow:0 0 0 2px rgba(59,130,246,0.1); }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }
      `}</style>
    </div>
  );
};

const S = {
  page:        { minHeight:'100vh', background:'#f8fafc', fontFamily:"'Inter',system-ui,sans-serif" },
  body:        { maxWidth:'1200px', margin:'0 auto', padding:'40px 24px' },
  header:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px', flexWrap:'wrap', gap:'12px' },
  title:       { fontSize:'30px', fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.5px' },
  sub:         { color:'#64748b', fontSize:'15px', marginTop:'4px' },
  aiBadge:     { display:'flex', alignItems:'center', gap:'6px', background:'#f3e8ff', border:'1px solid #e9d5ff', color:'#7e22ce', borderRadius:'20px', padding:'6px 14px', fontSize:'13px', fontWeight:700 },
  tabs:        { display:'flex', gap:'10px', marginBottom:'24px', flexWrap:'wrap' },
  tab:         { display:'flex', alignItems:'center', gap:'8px', background:'#ffffff', border:'1px solid #e2e8f0', color:'#475569', borderRadius:'12px', padding:'10px 18px', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s', boxShadow:'0 1px 2px rgba(0,0,0,0.05)' },
  tabActive:   { background:'#eff6ff', border:'1px solid #bfdbfe', color:'#2563eb' },
  grid:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' },
  panel:       { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'20px', padding:'28px', display:'flex', flexDirection:'column', gap:'16px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)' },
  panelTitle:  { fontSize:'20px', fontWeight:800, color:'#0f172a', margin:0 },
  panelSub:    { color:'#64748b', fontSize:'14px', lineHeight:'1.6' },
  field:       { display:'flex', flexDirection:'column', gap:'8px' },
  label:       { fontSize:'12px', fontWeight:700, color:'#475569', letterSpacing:'0.7px', textTransform:'uppercase' },
  toneRow:     { display:'flex', gap:'8px', flexWrap:'wrap' },
  toneBtn:     { display:'flex', alignItems:'center', gap:'6px', background:'#ffffff', border:'1px solid #e2e8f0', color:'#475569', borderRadius:'8px', padding:'8px 14px', fontSize:'13px', fontWeight:600, cursor:'pointer', textTransform:'capitalize', fontFamily:"'Inter',sans-serif", transition:'all 0.15s', boxShadow:'0 1px 2px rgba(0,0,0,0.02)' },
  toneBtnActive:{ background:'#eff6ff', border:'1px solid #bfdbfe', color:'#2563eb' },
  infoBox:     { display:'flex', alignItems:'center', gap:'8px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'10px', padding:'12px 14px', color:'#1e3a8a', fontSize:'14px', fontWeight:500 },
  examples:    { display:'flex', flexDirection:'column', gap:'8px' },
  exTitle:     { fontSize:'12px', fontWeight:700, color:'#64748b', letterSpacing:'0.5px', textTransform:'uppercase', margin:0 },
  chip:        { background:'#f8fafc', border:'1px solid #e2e8f0', color:'#475569', borderRadius:'8px', padding:'8px 12px', fontSize:'13px', cursor:'pointer', textAlign:'left', fontFamily:"'Inter',sans-serif", transition:'all 0.15s', fontWeight:500 },
  errBox:      { background:'#fef2f2', border:'1px solid #fecaca', color:'#ef4444', borderRadius:'10px', padding:'10px 14px', fontSize:'14px', fontWeight:500 },
  runBtn:      { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'linear-gradient(135deg,#2563eb,#4f46e5)', border:'none', color:'#fff', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:600, fontFamily:"'Inter',sans-serif", transition:'all 0.2s', boxShadow:'0 4px 12px rgba(59,130,246,0.25)' },
  spinner:     { width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' },
  bigSpinner:  { width:'40px', height:'40px', border:'3px solid #e2e8f0', borderTop:'3px solid #3b82f6', borderRadius:'50%', animation:'spin 0.9s linear infinite' },
  loadingWrap: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'200px', gap:'16px' },
  resultBlock: { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  resultLabel: { fontSize:'12px', fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.6px', margin:'0 0 12px' },
  resultText:  { fontSize:'15px', color:'#334155', lineHeight:'1.7', margin:0 },
  scriptBox:   { background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'16px', fontSize:'15px', color:'#1e293b', lineHeight:'1.8', fontStyle:'italic' },
  objRow:      { display:'flex', gap:'12px', alignItems:'flex-start', marginBottom:'12px' },
  objNum:      { width:'22px', height:'22px', borderRadius:'50%', background:'#eff6ff', color:'#2563eb', fontSize:'12px', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px' },
  objText:     { fontSize:'14px', color:'#334155', lineHeight:'1.7', fontWeight: 500 },
  copyBtn:     { background:'#f8fafc', border:'1px solid #cbd5e1', color:'#475569', borderRadius:'6px', padding:'6px 12px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif" },
  copyAllBtn:  { background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#166534', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' },
  scoreRing:   { width:'74px', height:'74px', borderRadius:'50%', border:'4px solid', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 },
  emptyOut:    { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'250px' },
};

export default AIHub;
