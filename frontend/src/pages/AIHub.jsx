import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

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

  const inp = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 14px', color:'#fff', fontSize:'14px', fontFamily:"'Inter',sans-serif", width:'100%', boxSizing:'border-box' };
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
            { id:'coach', icon:'🎯', label:'Sales Coach' },
            { id:'email', icon:'✉️', label:'Email Composer' },
            { id:'pipeline', icon:'📊', label:'Pipeline Health' },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setResult(null); setReport(null); setError(''); }}
              style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div style={S.grid}>
          {/* ── INPUT PANEL ── */}
          <div style={S.panel}>
            {/* Sales Coach */}
            {tab === 'coach' && (
              <>
                <h2 style={S.panelTitle}>🎯 AI Sales Coach</h2>
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
                <h2 style={S.panelTitle}>✉️ AI Email Composer</h2>
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
                        {t === 'friendly' ? '😊' : t === 'formal' ? '👔' : t === 'urgent' ? '🔥' : '🔄'} {t}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Pipeline Health */}
            {tab === 'pipeline' && (
              <>
                <h2 style={S.panelTitle}>📊 Pipeline Health Report</h2>
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
                  <p style={S.resultLabel}>💡 Advice</p>
                  <p style={S.resultText}>{result.advice}</p>
                </div>
                <div style={S.resultBlock}>
                  <p style={S.resultLabel}>📞 Call Script</p>
                  <div style={S.scriptBox}>{result.callScript}</div>
                </div>
                <div style={S.resultBlock}>
                  <p style={S.resultLabel}>🛡️ Objection Handlers</p>
                  {result.objections?.map((o, i) => (
                    <div key={i} style={S.objRow}>
                      <span style={S.objNum}>{i+1}</span>
                      <span style={S.objText}>{o}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...S.resultBlock, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)' }}>
                  <p style={{ ...S.resultLabel, color:'#34d399' }}>✅ Next Step</p>
                  <p style={S.resultText}>{result.nextStep}</p>
                </div>
              </div>
            )}

            {/* Email Composer Result */}
            {result && tab === 'email' && !loading && (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={S.resultBlock}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                    <p style={S.resultLabel}>📧 Subject Line</p>
                    <button onClick={() => navigator.clipboard.writeText(result.subject)} style={S.copyBtn}>Copy</button>
                  </div>
                  <div style={S.scriptBox}>{result.subject}</div>
                </div>
                <div style={S.resultBlock}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                    <p style={S.resultLabel}>📝 Email Body</p>
                    <button onClick={() => navigator.clipboard.writeText(result.body)} style={S.copyBtn}>Copy</button>
                  </div>
                  <div style={{ ...S.scriptBox, whiteSpace:'pre-line', maxHeight:'280px', overflowY:'auto' }}>{result.body}</div>
                </div>
                <div style={{ ...S.resultBlock, background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)' }}>
                  <p style={{ ...S.resultLabel, color:'#60a5fa' }}>🎯 Call To Action</p>
                  <p style={S.resultText}>{result.callToAction}</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`)} style={S.copyAllBtn}>
                  📋 Copy Full Email
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
                    <p style={{ color:'#fff', fontWeight:700, fontSize:'15px', margin:'0 0 4px' }}>Pipeline Health Score</p>
                    <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', margin:0 }}>{report.summary}</p>
                  </div>
                </div>
                <div style={S.resultBlock}>
                  <p style={S.resultLabel}>🎯 Forecast</p>
                  <p style={{ ...S.resultText, fontSize:'20px', fontWeight:700, color:'#34d399' }}>{report.forecast}</p>
                </div>
                {report.priorities?.length > 0 && (
                  <div style={S.resultBlock}>
                    <p style={S.resultLabel}>🔥 Top Priorities</p>
                    {report.priorities.map((p,i) => <div key={i} style={S.objRow}><span style={S.objNum}>{i+1}</span><span style={S.objText}>{p}</span></div>)}
                  </div>
                )}
                {report.atRisk?.length > 0 && (
                  <div style={{ ...S.resultBlock, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)' }}>
                    <p style={{ ...S.resultLabel, color:'#f87171' }}>⚠️ At Risk</p>
                    {report.atRisk.map((r,i) => <p key={i} style={{ ...S.resultText, marginBottom:'4px' }}>• {r}</p>)}
                  </div>
                )}
                {report.recommendations?.length > 0 && (
                  <div style={S.resultBlock}>
                    <p style={S.resultLabel}>💡 Recommendations</p>
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
        select option { background:#1a1a2e; }
        textarea::placeholder,input::placeholder { color:rgba(255,255,255,0.18); }
        textarea:focus,select:focus,input:focus { outline:none; border-color:#3b82f6 !important; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
      `}</style>
    </div>
  );
};

const S = {
  page:        { minHeight:'100vh', background:'linear-gradient(160deg,#08080f,#0c0c1a)', fontFamily:"'Inter',system-ui,sans-serif" },
  body:        { maxWidth:'1200px', margin:'0 auto', padding:'40px 24px' },
  header:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px', flexWrap:'wrap', gap:'12px' },
  title:       { fontSize:'28px', fontWeight:800, color:'#fff', margin:0, letterSpacing:'-0.5px' },
  sub:         { color:'rgba(255,255,255,0.3)', fontSize:'14px', marginTop:'4px' },
  aiBadge:     { display:'flex', alignItems:'center', gap:'6px', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)', color:'#a78bfa', borderRadius:'20px', padding:'6px 14px', fontSize:'13px', fontWeight:600 },
  tabs:        { display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap' },
  tab:         { display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)', borderRadius:'12px', padding:'10px 18px', fontSize:'14px', fontWeight:500, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.15s' },
  tabActive:   { background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.3)', color:'#60a5fa' },
  grid:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' },
  panel:       { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'28px', display:'flex', flexDirection:'column', gap:'16px' },
  panelTitle:  { fontSize:'18px', fontWeight:700, color:'#fff', margin:0 },
  panelSub:    { color:'rgba(255,255,255,0.35)', fontSize:'13px', lineHeight:'1.6' },
  field:       { display:'flex', flexDirection:'column', gap:'8px' },
  label:       { fontSize:'11px', fontWeight:600, color:'rgba(255,255,255,0.4)', letterSpacing:'0.7px', textTransform:'uppercase' },
  toneRow:     { display:'flex', gap:'8px', flexWrap:'wrap' },
  toneBtn:     { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)', borderRadius:'8px', padding:'8px 14px', fontSize:'13px', fontWeight:500, cursor:'pointer', textTransform:'capitalize', fontFamily:"'Inter',sans-serif", transition:'all 0.15s' },
  toneBtnActive:{ background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.3)', color:'#60a5fa' },
  infoBox:     { display:'flex', alignItems:'center', gap:'8px', background:'rgba(59,130,246,0.07)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:'10px', padding:'12px 14px', color:'rgba(147,197,253,0.8)', fontSize:'13px' },
  examples:    { display:'flex', flexDirection:'column', gap:'8px' },
  exTitle:     { fontSize:'11px', fontWeight:600, color:'rgba(255,255,255,0.3)', letterSpacing:'0.5px', textTransform:'uppercase', margin:0 },
  chip:        { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.45)', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', cursor:'pointer', textAlign:'left', fontFamily:"'Inter',sans-serif", transition:'all 0.15s' },
  errBox:      { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#fca5a5', borderRadius:'10px', padding:'10px 14px', fontSize:'13px' },
  runBtn:      { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'linear-gradient(135deg,#2563eb,#4f46e5)', border:'none', color:'#fff', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:600, fontFamily:"'Inter',sans-serif", transition:'all 0.2s' },
  spinner:     { width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' },
  bigSpinner:  { width:'40px', height:'40px', border:'3px solid rgba(255,255,255,0.07)', borderTop:'3px solid #3b82f6', borderRadius:'50%', animation:'spin 0.9s linear infinite' },
  loadingWrap: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'200px', gap:'16px' },
  resultBlock: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px' },
  resultLabel: { fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.6px', margin:'0 0 8px' },
  resultText:  { fontSize:'14px', color:'rgba(255,255,255,0.65)', lineHeight:'1.7', margin:0 },
  scriptBox:   { background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', padding:'12px 14px', fontSize:'14px', color:'rgba(255,255,255,0.7)', lineHeight:'1.7', fontStyle:'italic' },
  objRow:      { display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'8px' },
  objNum:      { width:'20px', height:'20px', borderRadius:'50%', background:'rgba(59,130,246,0.2)', color:'#60a5fa', fontSize:'11px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'1px' },
  objText:     { fontSize:'13px', color:'rgba(255,255,255,0.6)', lineHeight:'1.6' },
  copyBtn:     { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', borderRadius:'6px', padding:'4px 10px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif" },
  copyAllBtn:  { background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', color:'#34d399', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif" },
  scoreRing:   { width:'74px', height:'74px', borderRadius:'50%', border:'3px solid', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 },
  emptyOut:    { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'250px' },
};

export default AIHub;
