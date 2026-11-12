import { Link, NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { SIDEBAR_MAIN_LINKS, SIDEBAR_RESOURCE_LINKS } from '@/constants/sidebarLinks';

const NavItem = ({ label, path, icon: Icon, badge }) => {
  return (
    <NavLink 
      to={path}
      className={({ isActive }) => `flex items-center justify-between py-2.5 px-3 rounded-lg mb-1 transition-colors text-[15px] font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-slate-50'}`}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} strokeWidth={isActive ? 2.5 : 2} />
            <span className="truncate">{label}</span>
          </div>
          {badge && (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

const Sidebar = ({ onClose }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-[70px] px-6 border-b border-slate-200 shrink-0">
        <Link to="/" className="flex items-center gap-2 h-10">
          <img src="/logo.png" alt="India Retails & Hospitality Private Limited" className="h-full object-contain" />
        </Link>
        <button className="lg:hidden p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-lg" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="mb-8">
          {SIDEBAR_MAIN_LINKS.map(link => (
            <NavItem key={link.path} {...link} />
          ))}
        </div>

        <div>
          <div className="px-3 pb-2 mb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Resources</span>
          </div>
          {SIDEBAR_RESOURCE_LINKS.map(link => (
            <NavItem key={link.path} {...link} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
