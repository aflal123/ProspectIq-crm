import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const IconBolt = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#3b82f6" stroke="none">
    <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z"/>
  </svg>
);

const OTPVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // One ref per input box so we can focus programmatically
  const inputRefs = useRef([]);

  // If someone lands here without going through Login, kick them back
  useEffect(() => {
    if (!email) navigate('/login', { replace: true });
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle a single digit box change
  const handleChange = (index, value) => {
    // Only allow one numeric digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');

    // Auto-advance to next box
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 are filled
    if (digit && index === 5) {
      const otp = [...newDigits.slice(0, 5), digit].join('');
      if (otp.length === 6 && !otp.includes('')) {
        submitOTP(otp);
      }
    }
  };

  // Backspace goes to previous box
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste — fill all 6 boxes at once
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = [...digits];
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setDigits(newDigits);
      
      // Focus the last filled box or the next empty one
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (pastedData.length === 6) {
        submitOTP(pastedData);
      }
    }
  };

  const submitOTP = async (otp) => {
    setError('');
    setLoading(true);
    try {
      // POST /api/auth/verify-otp → returns { token, user }
      const res = await api.post('/auth/verify-otp', { email, otp });

      // Save JWT and user info — all future API calls use this token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Go to the main dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 6) { setError('Please enter all 6 digits.'); return; }
    submitOTP(otp);
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await api.post('/auth/resend-otp', { email });
      setResendCooldown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Could not resend OTP. Try again.');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email && email.includes('@')
    ? email.split('@')[0].slice(0, 2) + '****@' + email.split('@')[1]
    : email || 'your email';

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}><IconBolt /></div>
          <h1 style={styles.logo}>Prospect<span style={styles.logoAccent}>IQ</span></h1>
          <p style={styles.tagline}>CRM for modern sales teams</p>
        </div>

        {/* Card */}
        <div style={styles.card}>
          {/* Mail icon graphic */}
          <div style={styles.iconCircle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>

          <h2 style={styles.cardTitle}>Check your email</h2>
          <p style={styles.cardSub}>
            We sent a 6-digit code to<br />
            <span style={styles.emailHighlight}>{maskedEmail}</span>
          </p>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 6 digit boxes */}
            <div style={styles.digitRow} onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={loading}
                  style={{
                    ...styles.digitInput,
                    borderColor: digit ? '#3b82f6' : '#e2e8f0',
                    background: digit ? '#eff6ff' : '#ffffff',
                    color: digit ? '#0f172a' : '#94a3b8',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e => { if (!digit) { e.target.style.borderColor = '#cbd5e1'; } e.target.style.boxShadow = 'none'; }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              type="submit"
              disabled={loading || digits.join('').length < 6}
              style={{
                ...styles.btn,
                opacity: loading || digits.join('').length < 6 ? 0.6 : 1,
                cursor: loading || digits.join('').length < 6 ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(59,130,246,0.45)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(59,130,246,0.25)'; }}
            >
              {loading ? (
                <span style={styles.btnContent}><span style={styles.spinner} /> Verifying...</span>
              ) : (
                <span style={styles.btnContent}>
                  Verify & Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </span>
              )}
            </button>
          </form>

          {/* Resend */}
          <div style={styles.resendWrap}>
            <span style={styles.resendText}>Didn't receive it?</span>
            {resendCooldown > 0 ? (
              <span style={styles.cooldown}>Resend in {resendCooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                style={styles.resendBtn}
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          {/* Steps */}
          <div style={styles.steps}>
            {['Credentials', 'Verify OTP', 'Dashboard'].map((step, i) => (
              <div key={step} style={styles.stepItem}>
                <div style={{ ...styles.stepDot, background: i === 1 ? '#3b82f6' : i < 1 ? '#10b981' : '#e2e8f0', boxShadow: i === 1 ? '0 0 12px rgba(59,130,246,0.5)' : 'none' }}>
                  {i < 1 ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <span style={styles.stepNum}>{i + 1}</span>
                  )}
                </div>
                <span style={{ ...styles.stepLabel, color: i === 1 ? '#475569' : i < 1 ? '#10b981' : '#94a3b8' }}>{step}</span>
                {i < 2 && <div style={styles.stepLine} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { outline: none; }
        input[type='text'] { caret-color: #3b82f6; }
      `}</style>
    </div>
  );
};

const styles = {
  page: { minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter', system-ui, sans-serif", position:'relative', overflow:'hidden', padding:'20px' },
  orb1: { position:'absolute', top:'-10%', right:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', animation:'float1 8s ease-in-out infinite', pointerEvents:'none' },
  orb2: { position:'absolute', bottom:'-15%', left:'-10%', width:'550px', height:'550px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)', animation:'float2 11s ease-in-out infinite', pointerEvents:'none' },
  container: { width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', alignItems:'center', gap:'24px', position:'relative', zIndex:10 },
  logoWrap: { textAlign:'center' },
  logoIcon: { marginBottom:'10px', display:'flex', justifyContent:'center' },
  logo: { fontSize:'28px', fontWeight:800, color:'#0f172a', letterSpacing:'3px', margin:0 },
  logoAccent: { color:'#2563eb' },
  tagline: { color:'#64748b', fontSize:'13px', marginTop:'6px' },
  card: { width:'100%', background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'24px', padding:'36px 32px', boxShadow:'0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)', display:'flex', flexDirection:'column', alignItems:'center' },
  iconCircle: { width:'64px', height:'64px', borderRadius:'50%', background:'#eff6ff', border:'1px solid #bfdbfe', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px' },
  cardTitle: { fontSize:'22px', fontWeight:700, color:'#0f172a', margin:0, textAlign:'center' },
  cardSub: { color:'#64748b', fontSize:'14px', marginTop:'8px', marginBottom:'28px', textAlign:'center', lineHeight:'1.6' },
  emailHighlight: { color:'#2563eb', fontWeight:600 },
  errorBox: { width:'100%', background:'#fef2f2', border:'1px solid #fecaca', color:'#ef4444', borderRadius:'12px', padding:'12px 16px', fontSize:'13px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' },
  digitRow: { display:'flex', gap:'10px', justifyContent:'center', marginBottom:'28px' },
  digitInput: {
    width:'48px', height:'56px', textAlign:'center',
    fontSize:'22px', fontWeight:700,
    border:'1px solid', borderRadius:'12px',
    transition:'all 0.15s ease',
    fontFamily:"'Inter', sans-serif",
  },
  btn: { width:'100%', background:'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', color:'#fff', border:'none', borderRadius:'12px', padding:'15px', fontSize:'15px', fontWeight:600, transition:'all 0.2s ease', boxShadow:'0 4px 12px rgba(59,130,246,0.25)', fontFamily:"'Inter', sans-serif", cursor:'pointer' },
  btnContent: { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' },
  spinner: { width:'15px', height:'15px', border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' },
  resendWrap: { display:'flex', alignItems:'center', gap:'8px', marginTop:'20px' },
  resendText: { color:'#64748b', fontSize:'13px' },
  cooldown: { color:'#94a3b8', fontSize:'13px', fontWeight:500 },
  resendBtn: { background:'none', border:'none', color:'#2563eb', fontSize:'13px', fontWeight:600, cursor:'pointer', padding:0, fontFamily:"'Inter', sans-serif" },
  steps: { display:'flex', alignItems:'center', marginTop:'28px' },
  stepItem: { display:'flex', alignItems:'center', gap:'8px' },
  stepDot: { width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  stepNum: { fontSize:'10px', color:'#94a3b8', fontWeight:600 },
  stepLabel: { fontSize:'11px', fontWeight:500, whiteSpace:'nowrap' },
  stepLine: { width:'24px', height:'1px', background:'#e2e8f0', margin:'0 8px' },
};

export default OTPVerify;
