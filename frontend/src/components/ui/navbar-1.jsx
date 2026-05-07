import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, UserCircle, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Pipeline", path: "/leads" },
    { name: "AI Hub", path: "/ai" },
    { name: "Admin Portal", path: "/admin" }
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.navContainer}>
        {/* Left: Logo */}
        <div style={styles.logoWrap}>
          <Link to="/dashboard" style={styles.logoLink}>
            <motion.div
              style={styles.logoIconWrap}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.logoIconBg}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z"/></svg>
              </div>
            </motion.div>
            <span style={styles.logoText}>
              Prospect<span style={{ color: '#2563eb' }}>IQ</span>
            </span>
          </Link>
        </div>
        
        {/* Center: Desktop Navigation */}
        <nav className="desktop-only" style={styles.desktopNav}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link 
                  to={item.path} 
                  style={{ ...styles.navLink, color: active ? '#2563eb' : '#475569' }}
                >
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Right: Desktop User & Logout */}
        <div className="desktop-only" style={styles.desktopUserBox}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <LogOut size={16} /> Sign out
            </button>
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button className="mobile-only" style={styles.mobileMenuBtn} onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          <Menu size={24} color="#0f172a" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            style={styles.mobileOverlay}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              style={styles.closeBtn}
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X size={32} color="#0f172a" />
            </motion.button>
            <div style={styles.mobileMenuContent}>
              {navItems.map((item, i) => {
                const active = isActive(item.path);
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Link 
                      to={item.path} 
                      style={{ ...styles.mobileNavLink, color: active ? '#2563eb' : '#0f172a' }} 
                      onClick={toggleMenu}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                style={styles.mobileBottomBox}
              >
                <div style={styles.mobileUserRow}>
                  <UserCircle size={24} color="#3b82f6" />
                </div>
                <button
                  onClick={() => { handleLogout(); toggleMenu(); }}
                  style={styles.mobileLogoutBtn}
                >
                  <LogOut size={20} /> Sign out
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .desktop-only { display: flex !important; }
        .mobile-only { display: none !important; }
        
        @media (max-width: 860px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

// ── Inline Styles ───────────────────────────────────────────────
const styles = {
  wrapper: { display: 'flex', justifyContent: 'center', width: '100%', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 50 },
  navContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: '99px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', border: '1px solid #e2e8f0', width: '100%', maxWidth: '1100px', position: 'relative', zIndex: 10 },
  logoWrap: { display: 'flex', alignItems: 'center' },
  logoLink: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
  logoIconWrap: { width: '32px', height: '32px', marginRight: '8px' },
  logoIconBg: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(37,99,235,0.3)' },
  logoText: { color: '#0f172a', fontSize: '20px', fontWeight: 800, letterSpacing: '0.5px' },
  desktopNav: { display: 'flex', alignItems: 'center', gap: '32px' },
  navLink: { fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s ease', fontFamily: "'Inter', sans-serif" },
  desktopUserBox: { display: 'flex', alignItems: 'center', gap: '16px' },
  userName: { color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontFamily: "'Inter', sans-serif" },
  logoutBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '8px 20px', fontSize: '14px', fontWeight: 600, color: '#fff', background: '#0f172a', borderRadius: '99px', border: 'none', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'Inter', sans-serif" },
  mobileMenuBtn: { display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  mobileOverlay: { position: 'fixed', inset: 0, background: '#fff', zIndex: 40, paddingTop: '96px', paddingLeft: '24px', paddingRight: '24px' },
  closeBtn: { position: 'absolute', top: '24px', right: '24px', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 50 },
  mobileMenuContent: { display: 'flex', flexDirection: 'column', gap: '24px' },
  mobileNavLink: { fontSize: '24px', fontWeight: 700, textDecoration: 'none', fontFamily: "'Inter', sans-serif" },
  mobileBottomBox: { paddingTop: '32px', marginTop: '16px', borderTop: '1px solid #f1f5f9' },
  mobileUserRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  mobileLogoutBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700, color: '#fff', background: '#0f172a', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
};

export { Navbar1 };
