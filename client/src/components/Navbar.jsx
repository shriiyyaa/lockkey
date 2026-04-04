import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-mono-950/80 backdrop-blur-lg border-b border-white/10 shadow-[0_2px_0_0_#000]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group hover:-translate-y-0.5 transition-transform">
          <span className="text-xl font-black tracking-normal text-ivory uppercase">lockkey</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            id="nav-dashboard"
            className={`px-3 py-1.5 rounded-none text-[11px] font-black uppercase tracking-widest transition-all duration-200 border-2 ${
              isActive('/') 
                ? 'bg-ivory border-mono-950 text-mono-950 shadow-[2px_2px_0_0_#3f3f46]' 
                : 'bg-transparent border-transparent text-mono-400 hover:text-ivory'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/create"
            id="nav-create-lock"
            className={`px-3 py-1.5 rounded-none text-[11px] font-black uppercase tracking-widest transition-all duration-200 border-2 ${
              isActive('/create') 
                ? 'bg-ivory border-mono-950 text-mono-950 shadow-[2px_2px_0_0_#3f3f46]' 
                : 'bg-mono-900/40 border-ivory/5 text-mono-400 hover:text-ivory hover:border-ivory/10'
            }`}
          >
            New Lock
          </Link>

          <div className="ml-2 sm:ml-4 pl-2 sm:pl-4 border-l-2 border-mono-700 flex items-center gap-4">
            <div className="flex items-center gap-3" title={user.name}>
              <div className="w-8 h-8 flex items-center justify-center rounded-none bg-ivory border-2 border-mono-950 shadow-[2px_2px_0_0_#3f3f46] text-mono-950 font-black text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-bold text-mono-300 hidden md:inline">
                {user.name}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              id="btn-logout"
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-mono-400 bg-mono-950 hover:bg-red-600 hover:text-ivory border-2 border-mono-900 hover:border-mono-950 shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all duration-200 rounded-none"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
