import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const NavDropdown = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  let timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div 
      className="relative group" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className="flex items-center text-brand-textLight hover:text-white font-medium text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded px-2 py-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="whitespace-nowrap">{item.label}</span>
        <ChevronDown className={`ml-1 w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 rounded-xl shadow-xl bg-brand-navyLight border border-white/10 py-2 z-50 animate-fade-in origin-top-left">
          {item.dropdown.map((subItem, idx) => (
            <Link
              key={idx}
              to={subItem.href}
              className="block px-4 py-2.5 text-sm text-brand-textLight hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              {subItem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavDropdown;
