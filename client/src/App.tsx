import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VistaraAiModal } from './components/VistaraAiModal';
import { VivaExplanationModal } from './components/VivaExplanationModal';

// Pages
import { ServicesPage } from './pages/ServicesPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { ProviderProfilePage } from './pages/ProviderProfilePage';
import { BookingWizardPage } from './pages/BookingWizardPage';
import { BookingDetailsPage } from './pages/BookingDetailsPage';

import { CustomerDashboard } from './pages/CustomerDashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { HomePage } from './pages/HomeLandingPage';
import { useApp } from './context/AppContext';
import type { UserRole } from './types';

const BackendErrorNotice: React.FC = () => {
  const { backendError, clearBackendError } = useApp();
  const { pathname } = useLocation();
  if (!backendError || ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname)) return null;

  return (
    <div role="alert" className="mx-auto mt-4 flex w-[min(100%-2rem,72rem)] items-center justify-between gap-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <span>{backendError}</span>
      <button type="button" onClick={clearBackendError} className="shrink-0 font-semibold underline">Dismiss</button>
    </div>
  );
};

const roleDashboard: Record<UserRole, string> = {
  customer: '/customer/dashboard',
  provider: '/provider/dashboard',
  admin: '/admin/dashboard'
};

const ProtectedRoute: React.FC<{ roles: UserRole[]; children: React.ReactNode }> = ({ roles, children }) => {
  const { currentUser, isAuthReady } = useApp();
  if (!isAuthReady) return <div className="px-6 py-16 text-center text-slate-600">Checking your sign-in...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!roles.includes(currentUser.role)) return <Navigate to={roleDashboard[currentUser.role]} replace />;
  return <>{children}</>;
};

const AppShell: React.FC = () => {
  const [isFooterVisible, setIsFooterVisible] = React.useState(false);

  React.useEffect(() => {
    const footer = document.querySelector('.site-footer');
    if (!footer) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsFooterVisible(entry.isIntersecting);
    }, { threshold: 0.02 });

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <AppProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
          <Navbar />

          <main className="flex-1">
            <BackendErrorNotice />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:categorySlug" element={<ServicesPage />} />
              <Route path="/providers" element={<ProvidersPage />} />
              <Route path="/provider/:id" element={<ProviderProfilePage />} />
              <Route path="/search" element={<ProvidersPage />} />
              <Route path="/book/:providerId" element={<BookingWizardPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Customer Routes */}
              <Route path="/customer/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/customer/booking/:id" element={<ProtectedRoute roles={['customer']}><BookingDetailsPage /></ProtectedRoute>} />
              <Route path="/customer/messages" element={<ProtectedRoute roles={['customer']}><BookingDetailsPage /></ProtectedRoute>} />

              {/* Provider Routes */}
              <Route path="/provider/dashboard" element={<ProtectedRoute roles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
              <Route path="/provider/booking/:id" element={<ProtectedRoute roles={['provider']}><BookingDetailsPage /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />

          {/* Global Floating Modals */}
          <VistaraAiModal />
          <VivaExplanationModal />

          {/* Floating WhatsApp Button */}
          <a
            href="https://wa.me/918755607281?text=Namaste%20Digital%20Vistara!%20%F0%9F%99%8F%0AMujhe%20aapki%20services%20ke%20baare%20mein%20jaankari%20chahiye.%20Kya%20aap%20help%20kar%20sakte%20hain%3F"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className={`site-whatsapp-button fixed bottom-6 right-6 z-50 group flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-transform hover:scale-110 ${isFooterVisible ? 'is-footer-visible' : ''}`}
            style={{ backgroundColor: '#25D366' }}
          >
            {/* Pulse ring */}
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-40"
              style={{ backgroundColor: '#25D366' }}
            />
            {/* WhatsApp SVG */}
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 fill-white relative z-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {/* Tooltip */}
            <span className="absolute right-16 bottom-1/2 translate-y-1/2 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Chat on WhatsApp
            </span>
          </a>
        </div>
    </AppProvider>
  );
};

export const App: React.FC = () => (
  <AppProvider>
    <Router>
      <AppShell />
    </Router>
  </AppProvider>
);

export default App;
