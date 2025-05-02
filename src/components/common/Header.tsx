import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Settings, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type HeaderProps = {
  title: string;
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dashboard links based on user role
  const getNavLinks = () => {
    const baseUrl = user?.role === 'admin' 
      ? '/admin' 
      : user?.role === 'boys' 
        ? '/boys' 
        : '/girls';

    const links = [
      { name: 'Dashboard', path: `${baseUrl}/dashboard`, icon: <Home size={18} /> },
    ];

    if (user?.role === 'admin') {
      links.push(
        { name: 'Tickets', path: `${baseUrl}/tickets`, icon: <Bell size={18} /> },
        { name: 'Statistics', path: `${baseUrl}/stats`, icon: <Settings size={18} /> }
      );
    } else {
      links.push(
        { name: 'New Ticket', path: `${baseUrl}/new-ticket`, icon: <Bell size={18} /> },
        { name: 'My Tickets', path: `${baseUrl}/tickets`, icon: <Settings size={18} /> }
      );
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            className="md:hidden mr-4 text-neutral-700"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Logo and Title */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary-600">Hostel Fix</span>
            <span className="hidden md:block mx-4 text-neutral-300">|</span>
            <h1 className="text-lg md:text-xl font-semibold text-neutral-800">{title}</h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-2 py-1 rounded transition-colors ${
                location.pathname === link.path
                  ? 'text-primary-600 font-medium'
                  : 'text-neutral-600 hover:text-primary-600'
              }`}
            >
              <span className="mr-2">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="relative">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={toggleProfile}
          >
            <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
              <User size={18} />
            </div>
            <span className="hidden md:block text-sm font-medium">{user?.name}</span>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 animate-fade-in">
              <div className="px-4 py-2 border-b border-neutral-100">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
              </div>
              <Link
                to={`/${user?.role}/profile`}
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left flex items-center"
                onClick={() => setIsProfileOpen(false)}
              >
                <User size={16} className="mr-2" />
                My Profile
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin/settings"
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full text-left flex items-center"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-sm text-error-600 hover:bg-neutral-50 w-full text-left flex items-center"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 animate-slide-up">
          <nav className="container mx-auto px-4 py-3 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-3 ${
                  location.pathname === link.path
                    ? 'text-primary-600 bg-primary-50 rounded-md font-medium'
                    : 'text-neutral-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;