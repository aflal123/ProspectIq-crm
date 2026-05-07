import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Users, Settings, Activity, Shield, Trash2, Lock, KeyRound, X, LogOut } from 'lucide-react';

const AdminPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('adminAuth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  
  const [activeTab, setActiveTab] = useState('users');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Add User Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [addingUser, setAddingUser] = useState(false);
  const [addErr, setAddErr] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const p = sessionStorage.getItem('adminPass');
      const res = await api.get('/admin/users', { headers: { 'x-admin-password': p } });
      setUsers(res.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('adminPass');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchUsers();
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    try {
      const res = await api.post('/admin/login', { password });
      if (res.data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminPass', password);
      }
    } catch (err) {
      setLoginErr(err.response?.data?.message || 'Login failed');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminPass');
    setPassword('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeletingId(id);
    try {
      const p = sessionStorage.getItem('adminPass');
      await api.delete(`/admin/users/${id}`, { headers: { 'x-admin-password': p } });
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true); setAddErr('');
    try {
      await api.post('/auth/register', newUser);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      setAddErr(err.response?.data?.message || 'Failed to add user');
    } finally {
      setAddingUser(false);
    }
  };

  const timeAgo = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return new Date(d).toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={S.loginCard}>
          <div style={S.lockIcon}><Lock size={32} color="#2563eb" /></div>
          <h2 style={S.loginTitle}>Admin Access</h2>
          <p style={S.loginSub}>Please enter the admin password to continue.</p>
          {loginErr && <div style={S.errBox}>{loginErr}</div>}
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={S.inputWrap}>
              <KeyRound size={18} color="#94a3b8" />
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
                placeholder="Admin Password" style={S.loginInput} required 
              />
            </div>
            <button type="submit" style={S.loginBtn}>Unlock Portal</button>
          </form>
        </div>
      </div>
    );
  }

  // Content renderers for tabs
  const renderUsers = () => (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <h2 style={S.cardTitle}>Users</h2>
        <div style={S.badge}><Users size={14}/> {users.length} total users</div>
      </div>
      {loading ? (
        <div style={{ padding:'40px', textAlign:'center', color:'#64748b' }}>Loading users...</div>
      ) : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Name</th>
                <th style={S.th}>Role</th>
                <th style={S.th}>Joined</th>
                <th style={S.th}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isAdmin = u.email === 'admin@example.com';
                return (
                  <tr key={u.id} style={S.tr}>
                    <td style={S.td}>
                      <div style={S.userCell}>
                        <div style={S.avatar}>{u.name?.[0]?.toUpperCase() || '?'}</div>
                        <div>
                          <p style={S.userName}>{u.name}</p>
                          <p style={S.userEmail}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={isAdmin ? S.roleAdmin : S.roleRep}>{isAdmin ? 'Admin' : 'User'}</span>
                    </td>
                    <td style={S.td}><span style={S.textMuted}>{timeAgo(u.created_at)}</span></td>
                    <td style={S.td}>
                      {!isAdmin && (
                        <button onClick={() => handleDelete(u.id)} style={S.iconBtn} disabled={deletingId === u.id}>
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderRoles = () => (
    <div style={S.card}>
      <div style={S.cardHeader}><h2 style={S.cardTitle}>Roles & Permissions</h2></div>
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead><tr><th style={S.th}>Role Name</th><th style={S.th}>Permissions</th><th style={S.th}>Users</th></tr></thead>
          <tbody>
            <tr style={S.tr}>
              <td style={S.td}><span style={S.roleAdmin}>Admin</span></td>
              <td style={S.td}><span style={S.textMuted}>Full system access, User Management, Billing</span></td>
              <td style={S.td}><span style={S.textMuted}>1</span></td>
            </tr>
            <tr style={S.tr}>
              <td style={S.td}><span style={S.roleRep}>User</span></td>
              <td style={S.td}><span style={S.textMuted}>Lead management, AI Hub access, Notes</span></td>
              <td style={S.td}><span style={S.textMuted}>{users.length > 0 ? users.length - 1 : 0}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div style={S.card}>
      <div style={S.cardHeader}><h2 style={S.cardTitle}>System Activity</h2></div>
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        {[
          { text: 'New user "Mike" registered.', time: '10 mins ago', type: 'user' },
          { text: 'Admin deleted a spam account.', time: '1 hr ago', type: 'admin' },
          { text: 'System backup completed successfully.', time: '5 hrs ago', type: 'system' }
        ].map((act, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'16px', paddingBottom:'16px', borderBottom:'1px solid #f1f5f9' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: act.type === 'user' ? '#10b981' : act.type === 'admin' ? '#f59e0b' : '#3b82f6' }} />
            <div style={{ flex:1 }}><p style={{ margin:0, color:'#0f172a', fontSize:'14px', fontWeight:500 }}>{act.text}</p></div>
            <span style={{ color:'#94a3b8', fontSize:'12px' }}>{act.time}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div style={S.card}>
      <div style={S.cardHeader}><h2 style={S.cardTitle}>General Settings</h2></div>
      <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
        <div>
          <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#475569', marginBottom:'8px' }}>Company Name</label>
          <input type="text" defaultValue="ProspectIQ Inc." style={S.formInput} />
        </div>
        <div>
          <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#475569', marginBottom:'8px' }}>Support Email</label>
          <input type="email" defaultValue="support@prospectiq.com" style={S.formInput} />
        </div>
        <button style={{ ...S.saveBtn, alignSelf:'flex-start' }} onClick={() => alert('Settings saved successfully!')}>Save Settings</button>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.body}>
        <div style={S.header}>
          <div>
            <h1 style={S.title}>Admin Portal</h1>
            <p style={S.sub}>Manage system users, roles, and settings</p>
          </div>
          <button style={S.addBtn} onClick={() => setShowAddModal(true)}>
            <Users size={16} /> Add User
          </button>
        </div>

        <div style={S.grid}>
          {/* Settings Sidebar */}
          <div style={S.sidebar}>
            {[
              { id:'users', icon:<Users size={18}/>, label:'User Management' },
              { id:'roles', icon:<Shield size={18}/>, label:'Roles & Permissions' },
              { id:'activity', icon:<Activity size={18}/>, label:'System Activity' },
              { id:'settings', icon:<Settings size={18}/>, label:'General Settings' }
            ].map(tab => (
              <div 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                style={activeTab === tab.id ? S.menuItemActive : S.menuItem}
              >
                {tab.icon} {tab.label}
              </div>
            ))}
            
            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0', marginTop: '20px' }}>
              <div 
                onClick={handleAdminLogout} 
                style={{ ...S.menuItem, color: '#ef4444' }}
              >
                <LogOut size={18} /> Lock Portal
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={S.content}>
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'roles' && renderRoles()}
            {activeTab === 'activity' && renderActivity()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <h2 style={S.modalTitle}>Add New User</h2>
              <button onClick={() => setShowAddModal(false)} style={S.closeBtn}><X size={18}/></button>
            </div>
            {addErr && <div style={S.errBox}>{addErr}</div>}
            <form onSubmit={handleAddUser} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <label style={S.formLabel}>Name</label>
                <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} style={S.formInput} required />
              </div>
              <div>
                <label style={S.formLabel}>Email</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={S.formInput} required />
              </div>
              <div>
                <label style={S.formLabel}>Password</label>
                <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={S.formInput} required minLength={6} />
              </div>
              <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={S.cancelBtn}>Cancel</button>
                <button type="submit" disabled={addingUser} style={S.saveBtn}>
                  {addingUser ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
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
  addBtn:      { display:'flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', border:'none', borderRadius:'10px', padding:'12px 20px', fontSize:'14px', fontWeight:600, cursor:'pointer', transition:'all 0.2s ease', fontFamily:"'Inter',sans-serif", boxShadow:'0 4px 12px rgba(59,130,246,0.25)' },
  grid:        { display:'grid', gridTemplateColumns:'240px 1fr', gap:'24px', alignItems:'start' },
  sidebar:     { display:'flex', flexDirection:'column', gap:'8px' },
  menuItem:    { display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'10px', color:'#475569', fontSize:'14px', fontWeight:600, cursor:'pointer', transition:'all 0.2s ease' },
  menuItemActive:{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'10px', color:'#2563eb', background:'#eff6ff', fontSize:'14px', fontWeight:700, cursor:'pointer' },
  content:     { display:'flex', flexDirection:'column', gap:'20px' },
  card:        { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'16px', padding:'24px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardHeader:  { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  cardTitle:   { fontSize:'18px', fontWeight:800, color:'#0f172a', margin:0 },
  badge:       { display:'flex', alignItems:'center', gap:'6px', background:'#eff6ff', color:'#2563eb', padding:'6px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:700 },
  tableWrap:   { border:'1px solid #e2e8f0', borderRadius:'12px', overflow:'hidden' },
  table:       { width:'100%', borderCollapse:'collapse' },
  th:          { padding:'14px 16px', textAlign:'left', fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.6px', borderBottom:'1px solid #e2e8f0', background:'#f8fafc' },
  tr:          { borderBottom:'1px solid #f1f5f9' },
  td:          { padding:'14px 16px', verticalAlign:'middle' },
  userCell:    { display:'flex', alignItems:'center', gap:'12px' },
  avatar:      { width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#2563eb,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'#fff', flexShrink:0, boxShadow:'0 2px 4px rgba(37,99,235,0.2)' },
  userName:    { fontSize:'14px', fontWeight:700, color:'#0f172a', margin:0 },
  userEmail:   { fontSize:'13px', color:'#64748b', margin:'2px 0 0' },
  roleAdmin:   { background:'#f3e8ff', color:'#7e22ce', padding:'4px 10px', borderRadius:'8px', fontSize:'12px', fontWeight:700 },
  roleRep:     { background:'#f1f5f9', color:'#475569', padding:'4px 10px', borderRadius:'8px', fontSize:'12px', fontWeight:700 },
  textMuted:   { color:'#64748b', fontSize:'13px', fontWeight:500 },
  iconBtn:     { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', cursor:'pointer', padding:'6px', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' },
  
  // Auth
  loginCard:   { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'24px', padding:'40px 32px', width:'100%', maxWidth:'400px', boxShadow:'0 10px 25px -5px rgba(0,0,0,0.05)', textAlign:'center' },
  lockIcon:    { width:'64px', height:'64px', background:'#eff6ff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' },
  loginTitle:  { fontSize:'24px', fontWeight:800, color:'#0f172a', margin:'0 0 8px' },
  loginSub:    { fontSize:'14px', color:'#64748b', margin:'0 0 24px' },
  inputWrap:   { display:'flex', alignItems:'center', gap:'12px', background:'#f8fafc', border:'1px solid #cbd5e1', borderRadius:'12px', padding:'12px 16px' },
  loginInput:  { border:'none', background:'transparent', outline:'none', width:'100%', fontSize:'15px', color:'#0f172a', fontFamily:"'Inter',sans-serif" },
  loginBtn:    { width:'100%', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(37,99,235,0.25)', fontFamily:"'Inter',sans-serif" },
  errBox:      { background:'#fef2f2', border:'1px solid #fecaca', color:'#ef4444', borderRadius:'10px', padding:'10px', fontSize:'14px', marginBottom:'16px', fontWeight:500 },

  // Forms & Modals
  overlay:     { position:'fixed', inset:0, background:'rgba(15,23,42,0.4)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' },
  modal:       { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'20px', padding:'32px', width:'100%', maxWidth:'480px', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  modalTitle:  { fontSize:'20px', fontWeight:800, color:'#0f172a', margin:0 },
  closeBtn:    { background:'#f8fafc', border:'1px solid #e2e8f0', color:'#64748b', borderRadius:'8px', padding:'6px', cursor:'pointer', display:'flex', alignItems:'center' },
  formLabel:   { display:'block', fontSize:'13px', fontWeight:600, color:'#475569', marginBottom:'6px' },
  formInput:   { width:'100%', background:'#f8fafc', border:'1px solid #cbd5e1', borderRadius:'10px', padding:'12px 14px', color:'#0f172a', fontSize:'14px', fontFamily:"'Inter',sans-serif", boxSizing:'border-box', outline:'none' },
  cancelBtn:   { flex:1, background:'#f8fafc', border:'1px solid #cbd5e1', color:'#475569', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif" },
  saveBtn:     { flex:2, background:'linear-gradient(135deg,#2563eb,#4f46e5)', border:'none', color:'#fff', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif", boxShadow:'0 4px 12px rgba(59,130,246,0.25)' },
};

export default AdminPortal;
