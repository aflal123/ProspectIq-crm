import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

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

const IconKey = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setSuccess('OTP sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess('Password reset successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
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

      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Reset Password</h2>
          <p style={styles.cardSub}>
            {step === 1 ? "Enter your email to receive an OTP." : "Enter the OTP sent to your email and your new password."}
          </p>

          {success && (
            <div style={styles.successBox}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {success}
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrap} onFocus={focusBorder} onBlur={blurBorder}>
                  <IconMail />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com" required style={styles.input}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.75 : 1 }}>
                {loading ? 'Sending OTP...' : 'Send Reset OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>6-Digit OTP</label>
                <div style={styles.inputWrap} onFocus={focusBorder} onBlur={blurBorder}>
                  <IconKey />
                  <input
                    type="text" value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="123456" required maxLength={6} style={{ ...styles.input, letterSpacing:'4px' }}
                  />
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>New Password</label>
                <div style={styles.inputWrap} onFocus={focusBorder} onBlur={blurBorder}>
                  <IconLock />
                  <input
                    type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••" required minLength={6} style={styles.input}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.75 : 1 }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div style={styles.switchWrap}>
            <Link to="/login" style={styles.link}>Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter', system-ui, sans-serif", position:'relative', overflow:'hidden', padding:'20px' },
  orb1: { position:'absolute', top:'-10%', left:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents:'none' },
  orb2: { position:'absolute', bottom:'-15%', right:'-10%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)', pointerEvents:'none' },
  container: { width:'100%', maxWidth:'420px', zIndex:10 },
  card: { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'24px', padding:'36px 32px', boxShadow:'0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)' },
  cardTitle: { fontSize:'22px', fontWeight:700, color:'#0f172a', margin:0, textAlign:'center' },
  cardSub: { color:'#64748b', fontSize:'13px', marginTop:'8px', marginBottom:'28px', textAlign:'center', lineHeight:'1.5' },
  successBox: { background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#166534', borderRadius:'12px', padding:'12px 16px', fontSize:'13px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' },
  errorBox: { background:'#fef2f2', border:'1px solid #fecaca', color:'#ef4444', borderRadius:'12px', padding:'12px 16px', fontSize:'13px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' },
  form: { display:'flex', flexDirection:'column', gap:'18px' },
  fieldGroup: { display:'flex', flexDirection:'column', gap:'8px' },
  label: { fontSize:'11px', fontWeight:600, color:'#475569', letterSpacing:'0.8px', textTransform:'uppercase' },
  inputWrap: { display:'flex', alignItems:'center', gap:'12px', background:'#ffffff', border:'1px solid #cbd5e1', borderRadius:'12px', padding:'13px 16px', transition:'border-color 0.2s ease' },
  input: { flex:1, background:'transparent', border:'none', color:'#0f172a', fontSize:'14px', fontFamily:"'Inter', sans-serif", outline:'none' },
  btn: { width:'100%', marginTop:'6px', background:'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', color:'#fff', border:'none', borderRadius:'12px', padding:'15px', fontSize:'15px', fontWeight:600, cursor:'pointer', fontFamily:"'Inter', sans-serif" },
  switchWrap: { textAlign:'center', marginTop:'24px' },
  link: { color:'#2563eb', textDecoration:'none', fontWeight:600, fontSize:'14px' },
};

export default ForgotPassword;
