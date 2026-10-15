import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, MapPin, Bell, ShieldCheck,
  Sparkles, ChevronDown, CheckCircle2, Menu, X, LayoutDashboard, LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INDIAN_CITIES } from '../data/mockData';
import { setAuthToken } from '../utils/api';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentUser, setCurrentUser, currentCity, setCurrentCity, 
    notifications, markNotificationRead, setIsAiModalOpen,
  } = useApp();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const handleSignOut = () => {
    setAuthToken(null);
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <header className="site-header sticky top-0 z-40">
      <div className="site-preview-bar">
        <Link
          to="/login?role=admin"
          className="site-admin-login"
        >
          <ShieldCheck aria-hidden="true" /> Admin Login
        </Link>
      </div>

      {/* Main Navbar */}
      <div className="site-nav-shell">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="site-brand flex items-center space-x-3 group">
            <div className="site-brand-mark">
              <Building2 aria-hidden="true" />
            </div>
            <div>
              <span className="site-brand-name">
                Digital <span>Vistara</span>
              </span>
              <span className="site-brand-caption">
                Local services, thoughtfully found
              </span>
            </div>
          </Link>

          {/* Location Selector */}
          <div className="hidden lg:relative lg:block">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="site-city-button"
            >
              <MapPin aria-hidden="true" />
              <span className="font-medium">{currentCity}</span>
              <ChevronDown aria-hidden="true" />
            </button>

            {isCityDropdownOpen && (
              <div className="site-popover absolute top-full left-0 mt-2 w-48 py-2 z-50">
                <div className="site-popover-heading">Choose your city</div>
                {INDIAN_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setCurrentCity(city);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`site-city-option ${city === currentCity ? 'is-active' : ''}`}
                  >
                    <span>{city}</span>
                    {city === currentCity && <CheckCircle2 aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="site-main-links hidden md:flex items-center">
            <Link to="/" className={location.pathname === '/' ? 'is-active' : ''}>
              Home
            </Link>
            <Link to="/services" className={location.pathname.startsWith('/services') ? 'is-active' : ''}>
              Services
            </Link>
            <Link to="/providers" className={location.pathname === '/providers' ? 'is-active' : ''}>
              Professionals
            </Link>
            <Link to="/how-it-works" className={location.pathname === '/how-it-works' ? 'is-active' : ''}>
              How It Works
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Vistara AI Floating Trigger */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="site-help-trigger"
              aria-label="Help me choose a service"
            >
              <Sparkles aria-hidden="true" />
              <span>Help me choose</span>
            </button>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="site-icon-button relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="site-popover absolute right-0 mt-2 w-80 py-2 z-50">
                  <div className="site-popover-heading flex justify-between items-center">
                    <span>Notifications</span>
                    <span className="site-notification-count">{unreadNotifs.length} new</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-slate-400 text-center">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.link) navigate(n.link);
                            setIsNotifOpen(false);
                          }}
                          className={`site-notification-item ${n.isRead ? 'is-read' : ''}`}
                        >
                          <div className="site-notification-title">{n.title}</div>
                          <div className="site-notification-message">{n.message}</div>
                          <div className="site-notification-time">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard / Profile Redirect */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={
                    currentUser.role === 'admin' ? '/admin/dashboard' :
                    currentUser.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard'
                  }
                  className="site-account-button"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>
                    {currentUser.role === 'admin' ? 'Admin Panel' :
                     currentUser.role === 'provider' ? 'Provider Panel' : 'My Dashboard'}
                  </span>
                </Link>
                <button type="button" onClick={handleSignOut} className="site-signout-button" aria-label="Sign out" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="site-auth-actions">
                <Link to="/login" className="site-signin-button">Sign In</Link>
                <Link to="/register" className="site-register-button">Register</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="site-mobile-toggle md:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="site-mobile-drawer md:hidden">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
          <Link to="/providers" onClick={() => setMobileMenuOpen(false)}>Professionals</Link>
          <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          {!currentUser && (
            <div className="site-mobile-auth-actions">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
          {currentUser && <button type="button" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="site-mobile-signout">Sign out</button>}
          <div className="pt-2">
            <span className="text-xs text-slate-400 block mb-1">Select City:</span>
            <div className="grid grid-cols-2 gap-2">
              {INDIAN_CITIES.map(c => (
                <button
                  key={c}
                  onClick={() => { setCurrentCity(c); setMobileMenuOpen(false); }}
                  className={`px-3 py-1 rounded text-xs text-left ${c === currentCity ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
