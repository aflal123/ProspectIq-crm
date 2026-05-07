import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Users, Settings, Activity, Shield, MoreVertical, ShieldAlert } from 'lucide-react';

const AdminPortal = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Aflal', email: 'aflal@example.com', role: 'Admin', status: 'active', lastActive: '2 mins ago' },
    { id: 2, name: 'Sarah Jane', email: 'sarah@example.com', role: 'Sales Rep', status: 'active', lastActive: '1 hr ago' },
    { id: 3, name: 'Mike Ross', email: 'mike@example.com', role: 'Sales Rep', status: 'inactive', lastActive: '2 days ago' },
  ]);

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.body}>
        <div style={S.header}>
          <div>
            <h1 style={S.title}>Admin Portal</h1>
            <p style={S.sub}>Manage system users, roles, and settings</p>
          </div>
          <button style={S.addBtn}>
            <Users size={16} /> Add User
          </button>
        </div>

        <div style={S.grid}>
          {/* Settings Sidebar */}
          <div style={S.sidebar}>
            <div style={S.menuItemActive}>
              <Users size={18} /> User Management
            </div>
            <div style={S.menuItem}>
              <Shield size={18} /> Roles & Permissions
            </div>
            <div style={S.menuItem}>
              <Activity size={18} /> System Activity
            </div>
            <div style={S.menuItem}>
              <Settings size={18} /> General Settings
            </div>
          </div>

          {/* Main Content */}
          <div style={S.content}>
            <div style={S.card}>
              <div style={S.cardHeader}>
                <h2 style={S.cardTitle}>Users</h2>
                <div style={S.badge}><ShieldAlert size={14}/> 1 pending approval</div>
              </div>

              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Name</th>
                      <th style={S.th}>Role</th>
                      <th style={S.th}>Status</th>
                      <th style={S.th}>Last Active</th>
                      <th style={S.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={S.tr}>
                        <td style={S.td}>
                          <div style={S.userCell}>
                            <div style={S.avatar}>{u.name[0]}</div>
                            <div>
                              <p style={S.userName}>{u.name}</p>
                              <p style={S.userEmail}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}>
                          <span style={u.role === 'Admin' ? S.roleAdmin : S.roleRep}>{u.role}</span>
                        </td>
                        <td style={S.td}>
                          <span style={u.status === 'active' ? S.statusActive : S.statusInactive}>
                            {u.status}
                          </span>
                        </td>
                        <td style={S.td}><span style={S.textMuted}>{u.lastActive}</span></td>
                        <td style={S.td}>
                          <button style={S.iconBtn}><MoreVertical size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  menuItemActive:{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderRadius:'10px', color:'#2563eb', background:'#eff6ff', fontSize:'14px', fontWeight:700 },
  content:     { display:'flex', flexDirection:'column', gap:'20px' },
  card:        { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'16px', padding:'24px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardHeader:  { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  cardTitle:   { fontSize:'18px', fontWeight:800, color:'#0f172a', margin:0 },
  badge:       { display:'flex', alignItems:'center', gap:'6px', background:'#fef2f2', color:'#dc2626', padding:'6px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:700 },
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
  statusActive:{ background:'#dcfce7', color:'#166534', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:700, textTransform:'capitalize' },
  statusInactive:{ background:'#f1f5f9', color:'#64748b', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:700, textTransform:'capitalize' },
  textMuted:   { color:'#64748b', fontSize:'13px', fontWeight:500 },
  iconBtn:     { background:'transparent', border:'none', color:'#94a3b8', cursor:'pointer', padding:'4px' },
};

export default AdminPortal;
