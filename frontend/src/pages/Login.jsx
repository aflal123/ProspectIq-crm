import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

// ── SVG Icons ──────────────────────────────────────────────
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = ({ show }) => (
  show ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  )
);

const IconBolt = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#3b82f6" stroke="none">
    <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z"/>
  </svg>
);

// ── Component ──────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Success message passed from Register page
  const successMsg = location.state?.message;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Step 1 — verify password → backend sends OTP
      const res = await api.post('/auth/login', form)

      // Move to OTP page — pass OTP so user sees it on screen even if email fails
      navigate('/verify-otp', { state: { email: form.email, otp: res.data.otp } })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const focusBorder = (e) => { e.currentTarget.style.borderColor = '#3b82f6'; };
  const blurBorder  = (e) => { e.currentTarget.style.borderColor = '#cbd5e1'; };

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}><IconBolt /></div>
          <h1 style={styles.logo}>Prospect<span style={styles.logoAccent}>IQ</span></h1>
          <p style={styles.tagline}>CRM for modern sales teams</p>
        </div>

        {/* Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Welcome back</h2>
          <p style={styles.cardSub}>Sign in to your account</p>

          {/* Success message from Register */}
          {successMsg && (
            <div style={styles.successBox}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {successMsg}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap} onFocus={focusBorder} onBlur={blurBorder}>
                <IconMail />
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="you@company.com"
                  required style={styles.input}
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label style={styles.label}>Password</label>
                <Link to="/forgot-password" style={{ color:'#2563eb', fontSize:'11px', textDecoration:'none', fontWeight:600 }}>Forgot Password?</Link>
              </div>
              <div style={styles.inputWrap} onFocus={focusBorder} onBlur={blurBorder}>
                <IconLock />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} placeholder="Your password"
                  required style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  tabIndex={-1}
                >
                  <IconEye show={showPassword} />
                </button>
              </div>
            </div>

            {/* OTP notice */}
            <div style={styles.otpNotice}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.7)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              A 6-digit OTP will be sent to your email after this step
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btn, opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(59,130,246,0.45)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(59,130,246,0.25)'; }}
            >
              {loading ? (
                <span style={styles.btnContent}><span style={styles.spinner} /> Verifying...</span>
              ) : (
                <span style={styles.btnContent}>
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </span>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine} />
          </div>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Create one</Link>
          </p>
        </div>

        {/* Steps indicator */}
        <div style={styles.steps}>
          {['Enter credentials', 'Verify OTP', 'Access CRM'].map((step, i) => (
            <div key={step} style={styles.stepItem}>
              <div style={{ ...styles.stepDot, background: i === 0 ? '#3b82f6' : '#e2e8f0', boxShadow: i === 0 ? '0 0 10px rgba(59,130,246,0.6)' : 'none' }}>
                {i === 0 ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <span style={styles.stepNum}>{i + 1}</span>
                )}
              </div>
              <span style={{ ...styles.stepLabel, color: i === 0 ? '#475569' : '#94a3b8' }}>{step}</span>
              {i < 2 && <div style={styles.stepLine} />}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,15px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #94a3b8; }
        input:focus { outline: none; }
        button { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
};

const styles = {
  page: { minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter', system-ui, sans-serif", position:'relative', overflow:'hidden', padding:'20px' },
  orb1: { position:'absolute', top:'-10%', left:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', animation:'float1 8s ease-in-out infinite', pointerEvents:'none' },
  orb2: { position:'absolute', bottom:'-15%', right:'-10%', width:'550px', height:'550px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)', animation:'float2 11s ease-in-out infinite', pointerEvents:'none' },
  orb3: { position:'absolute', top:'40%', right:'20%', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)', animation:'float3 13s ease-in-out infinite', pointerEvents:'none' },
  container: { width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', alignItems:'center', gap:'24px', position:'relative', zIndex:10 },
  logoWrap: { textAlign:'center' },
  logoIcon: { marginBottom:'10px', display:'flex', justifyContent:'center' },
  logo: { fontSize:'28px', fontWeight:800, color:'#0f172a', letterSpacing:'3px', margin:0 },
  logoAccent: { color:'#2563eb' },
  tagline: { color:'#64748b', fontSize:'13px', marginTop:'6px' },
  card: { width:'100%', background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'24px', padding:'36px 32px', boxShadow:'0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)' },
  cardTitle: { fontSize:'22px', fontWeight:700, color:'#0f172a', margin:0 },
  cardSub: { color:'#64748b', fontSize:'13px', marginTop:'5px', marginBottom:'28px' },
  successBox: { background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#166534', borderRadius:'12px', padding:'12px 16px', fontSize:'13px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' },
  errorBox: { background:'#fef2f2', border:'1px solid #fecaca', color:'#ef4444', borderRadius:'12px', padding:'12px 16px', fontSize:'13px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' },
  form: { display:'flex', flexDirection:'column', gap:'18px' },
  fieldGroup: { display:'flex', flexDirection:'column', gap:'8px' },
  label: { fontSize:'11px', fontWeight:600, color:'#475569', letterSpacing:'0.8px', textTransform:'uppercase' },
  inputWrap: { display:'flex', alignItems:'center', gap:'12px', background:'#ffffff', border:'1px solid #cbd5e1', borderRadius:'12px', padding:'13px 16px', transition:'border-color 0.2s ease' },
  input: { flex:1, background:'transparent', border:'none', color:'#0f172a', fontSize:'14px', fontFamily:"'Inter', sans-serif" },
  eyeBtn: { background:'none', border:'none', cursor:'pointer', padding:'0', display:'flex', alignItems:'center' },
  otpNotice: { display:'flex', alignItems:'center', gap:'7px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'10px', padding:'10px 14px', color:'#1e3a8a', fontSize:'12px' },
  btn: { width:'100%', marginTop:'6px', background:'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', color:'#fff', border:'none', borderRadius:'12px', padding:'15px', fontSize:'15px', fontWeight:600, transition:'all 0.2s ease', boxShadow:'0 4px 12px rgba(59,130,246,0.25)', fontFamily:"'Inter', sans-serif" },
  btnContent: { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' },
  spinner: { width:'15px', height:'15px', border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' },
  divider: { display:'flex', alignItems:'center', gap:'12px', margin:'24px 0 0 0' },
  dividerLine: { flex:1, height:'1px', background:'#e2e8f0' },
  dividerText: { color:'#94a3b8', fontSize:'12px' },
  switchText: { textAlign:'center', color:'#475569', fontSize:'14px', marginTop:'16px' },
  link: { color:'#2563eb', textDecoration:'none', fontWeight:600 },
  steps: { display:'flex', alignItems:'center', gap:'0' },
  stepItem: { display:'flex', alignItems:'center', gap:'8px' },
  stepDot: { width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  stepNum: { fontSize:'10px', color:'#94a3b8', fontWeight:600 },
  stepLabel: { fontSize:'11px', fontWeight:500, whiteSpace:'nowrap' },
  stepLine: { width:'28px', height:'1px', background:'#e2e8f0', margin:'0 8px' },
};

export default Login;
