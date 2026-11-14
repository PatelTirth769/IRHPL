import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Globe, Moon, Sun, Menu, X, ChevronDown } from 'lucide-react';
import { navLinks } from '@/constants/navLinks';
import { useTheme } from '@/context/ThemeContext';
import NavDropdown from './NavDropdown';
import Button from '../ui/Button';
import { useAuthStore } from '@/store/authStore';
import { User, LogOut, ChevronDown as ChevronDownIcon } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState(null);

  // Close mobile menu on resize to desktop (1024px +)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const toggleMobileSubmenu = (label) => {
    setExpandedMobileItem(expandedMobileItem === label ? null : label);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-brand-navy border-b border-white/10 h-[80px] lg:h-[90px] flex items-center">
        {/* Use max-w-[1800px] to ensure items fit without wrapping */}
        <div className="w-full max-w-[1800px] mx-auto px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between w-full">

            {/* Logo & Desktop Navigation */}
            <div className="flex items-center gap-3 xl:gap-5 2xl:gap-8 min-w-0">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center pr-1 lg:pr-2 xl:pr-4">
                <Link to="/" className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded h-10 lg:h-12">
                  <img src="/logo.png" alt="India Retails & Hospitality Private Limited" className="h-full object-contain bg-white p-1 rounded" />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1 xl:gap-2.5 2xl:gap-4">
                {navLinks.map((item) => (
                  item.dropdown ? (
                    <NavDropdown key={item.label} item={item} />
                  ) : (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="text-brand-textLight hover:text-white font-medium text-[13px] xl:text-[14px] whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-1 lg:px-1.5 py-1"
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </nav>
            </div>

            {/* Right side Actions */}
            <div className="hidden lg:flex flex-shrink-0 items-center gap-2.5 lg:gap-3 xl:gap-4 pl-2 lg:pl-3 xl:pl-5">
              <button className="flex items-center text-brand-textLight hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
                <Globe className="w-4 h-4 mr-1.5" />
                <span className="font-medium text-[13px] xl:text-[14px] whitespace-nowrap">English</span>
              </button>

              <button
                onClick={toggleTheme}
                aria-label="Toggle Dark Mode"
                className="text-brand-textLight hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {isLoading ? (
                <div className="flex items-center gap-3 border-l border-white/20 pl-4 animate-pulse">
                  <div className="w-20 h-8 bg-white/10 rounded"></div>
                  <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-2 xl:gap-3 border-l border-white/20 pl-2.5 xl:pl-4 relative">
                  <Button href="/dashboard" variant="primary" className="!px-3.5 xl:!px-5 !py-1.5 xl:!py-2 !text-[13px] xl:!text-[14px] whitespace-nowrap !rounded-full">
                    Dashboard
                  </Button>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 pr-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                  >
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center text-white font-semibold text-xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
                      </div>
                    )}
                    <ChevronDownIcon className="w-4 h-4 text-white" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 overflow-hidden">
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50">
                        <User className="w-4 h-4 text-gray-400" /> Dashboard
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium text-left"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5 xl:gap-3.5 border-l border-white/20 pl-2.5 xl:pl-4">
                  <Link
                    to="/login"
                    className="font-medium text-[13px] xl:text-[14px] text-brand-textLight hover:text-white whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-1.5 xl:px-2 py-1"
                  >
                    Log in
                  </Link>
                  <Button href="/register" variant="primary" className="!px-4 xl:!px-5 !py-2 !text-[13px] xl:!text-[14px] whitespace-nowrap !rounded-full flex-shrink-0 shadow-sm">
                    Get Started Free
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-3 ml-auto">
              <button
                onClick={toggleTheme}
                className="text-white p-2"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-white p-2 focus:outline-none"
                aria-label="Open Menu"
              >
                <Menu className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-brand-navy shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="p-4 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center h-8">
            <img src="/logo.png" alt="India Retails & Hospitality Private Limited" className="h-full object-contain bg-white p-1 rounded" />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-300 hover:bg-white/10 rounded-full"
            aria-label="Close Menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 flex flex-col space-y-4">
          {navLinks.map((item) => (
            <div key={item.label} className="border-b border-white/10 pb-4">
              {item.dropdown ? (
                <div>
                  <button
                    className="flex justify-between items-center w-full text-left font-medium text-lg text-white"
                    onClick={() => toggleMobileSubmenu(item.label)}
                  >
                    {item.label}
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedMobileItem === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMobileItem === item.label && (
                    <div className="mt-3 pl-4 space-y-3 flex flex-col">
                      {item.dropdown.map((sub, idx) => (
                        <Link
                          key={idx}
                          to={sub.href}
                          className="text-brand-textLight hover:text-white text-base transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href}
                  className="block font-medium text-lg text-white w-full hover:text-brand-textLight transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}

          <div className="pt-4 border-b border-white/10 pb-4">
            <button className="flex items-center text-brand-textLight hover:text-white font-medium text-lg w-full transition-colors">
              <Globe className="w-5 h-5 mr-3" />
              English
            </button>
          </div>

          <div className="pt-6 space-y-4 flex flex-col">
            {isLoading ? (
              <div className="animate-pulse space-y-4 flex flex-col">
                <div className="h-12 bg-white/10 rounded w-full"></div>
                <div className="h-12 bg-white/10 rounded-full w-full"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <Button href="/dashboard" variant="primary" className="w-full justify-center !py-3 !rounded-full">
                  Dashboard
                </Button>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:text-red-300 font-medium"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </>
            ) : (
              <>
                <Button href="/login" variant="secondary" className="w-full justify-center !py-3">
                  Log In
                </Button>
                <Button href="/register" variant="primary" className="w-full justify-center !py-3 !rounded-full">
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
