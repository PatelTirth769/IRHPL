import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Globe, Bell, ChevronDown, User, Settings, Home, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const DashboardTopbar = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef();
  const notifRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : (user?.email?.split('@')[0] || 'User');
  const initials = firstName.substring(0, 2).toUpperCase();

  return (
    <header className="h-[70px] bg-white border-b border-slate-200 shrink-0 px-6 flex items-center justify-between lg:justify-end sticky top-0 z-30">
      <div className="flex items-center gap-4 lg:hidden">
        <button onClick={onMenuClick} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Language selector mock */}
        <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
          <Globe className="w-4 h-4 text-gray-500" />
          English
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-4 z-50">
              <div className="px-4 pb-3 border-b border-slate-100 mb-2">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button 
            className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-2 rounded-full border border-transparent hover:border-slate-200 transition-all"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={firstName} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs border border-slate-200">
                {initials}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{firstName}</span>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 mb-2 border-b border-slate-100">
                <p className="text-sm font-medium text-gray-900">{firstName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                <User className="w-4 h-4 text-gray-300" /> Profile
              </div>
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                <Settings className="w-4 h-4 text-gray-300" /> Settings
              </div>
              <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50">
                <Home className="w-4 h-4 text-gray-400" /> Home page
              </Link>
              <div className="h-px bg-slate-100 my-2"></div>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
