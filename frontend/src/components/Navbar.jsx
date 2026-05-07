import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path
      ? 'text-white border-b-2 border-white pb-0.5'
      : 'text-gray-400 hover:text-white transition-colors';

  return (
    <nav className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <Link to="/dashboard" className="text-white text-xl font-bold tracking-widest">
        Prospect<span className="text-blue-500">IQ</span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className={`text-sm font-medium ${isActive('/dashboard')}`}>
          Dashboard
        </Link>
        <Link to="/leads" className={`text-sm font-medium ${isActive('/leads')}`}>
          Leads
        </Link>
        <Link to="/ai" className={`text-sm font-medium ${isActive('/ai')}`}>
          AI Hub
        </Link>
        <Link to="/admin" className={`text-sm font-medium ${isActive('/admin')}`}>
          Admin Portal
        </Link>
      </div>

      {/* User + Logout */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm hidden sm:flex items-center gap-2">
          <UserCircle size={18} />
          {user.name || 'User'}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors border border-slate-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
