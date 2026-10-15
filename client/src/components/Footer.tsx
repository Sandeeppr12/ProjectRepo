import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, HeartPulse, MessageCircle } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer bg-slate-950 text-slate-400 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="site-footer-brand-lockup flex items-center space-x-3">
              <div className="site-footer-mark">
                <Building2 aria-hidden="true" />
              </div>
              <div>
                <span className="site-footer-brand">
                  Digital <span>Vistara</span>
                </span>
                <span className="site-footer-tagline">
                  Local services, thoughtfully found
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              Find capable local professionals for the everyday work and important moments that make a place feel like home.
            </p>

            <Link to="/services" className="site-footer-explore">Explore services <span aria-hidden="true">-&gt;</span></Link>
          </div>

          {/* 5 Primary Categories */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Primary Categories
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/services/home-services" className="site-footer-link flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>1. Home Services</span>
                </Link>
              </li>
              <li>
                <Link to="/services/event-management" className="site-footer-link flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>2. Event Management</span>
                </Link>
              </li>
              <li>
                <Link to="/services/digital-marketing-it" className="site-footer-link flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  <span>3. Digital Marketing & IT</span>
                </Link>
              </li>
              <li>
                <Link to="/services/healthcare" className="site-footer-link flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>4. Healthcare</span>
                </Link>
              </li>
              <li>
                <Link to="/services/education" className="site-footer-link flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>5. Education</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Platform Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/providers" className="site-footer-link">Meet the professionals</Link></li>
              <li><Link to="/how-it-works" className="site-footer-link">How it works</Link></li>
              <li><Link to="/about" className="site-footer-link">About us</Link></li>
              <li><Link to="/contact" className="site-footer-link">Contact</Link></li>
              <li><Link to="/faq" className="site-footer-link">Common questions</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Contact & Support
            </h3>
            <div className="space-y-3 text-xs">
              <a className="site-footer-contact" href="https://wa.me/918755607281" target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" /> Chat on WhatsApp
              </a>
              <Link className="site-footer-contact" to="/contact">Send us a message</Link>
              <Link className="site-footer-contact" to="/faq">Visit the help centre</Link>
            </div>
          </div>

        </div>

        {/* Healthcare Disclaimer Box */}
        <div className="site-footer-disclaimer bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-8 text-xs text-slate-400 flex items-start space-x-3">
          <HeartPulse className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block mb-1">Healthcare Disclaimer:</span>
            Healthcare services on DIGITAL VISTARA (such as home nursing, physiotherapy, patient care, and sample collection) are provided by independent certified healthcare professionals for non-emergency home assistance. DIGITAL VISTARA is not a hospital and does not provide emergency medical services or formal medical diagnosis. In case of medical emergencies, please immediately visit the nearest hospital or call national emergency numbers (108 / 112).
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Digital Vistara. All rights reserved.</div>
        </div>

      </div>
    </footer>
  );
};
