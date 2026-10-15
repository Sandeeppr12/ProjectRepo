import React from 'react';
import { Building2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import './AuthPageLayout.css';

interface AuthPageLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  eyebrow,
  title,
  description,
  footer,
  children
}) => (
  <section className="auth-page">
    <div className="auth-layout">
      <aside className="auth-story">
        <div className="auth-story-topline">
          <span className="auth-story-mark"><Building2 aria-hidden="true" /></span>
          <span>Digital Vistara</span>
        </div>

        <div className="auth-story-copy">
          <p className="auth-story-eyebrow"><Sparkles aria-hidden="true" /> Local services, thoughtfully found</p>
          <h2>Good help makes room for <em>what matters.</em></h2>
          <p>Discover trusted people for everyday work, care, learning, and life’s important moments.</p>
          <ul>
            <li><CheckCircle2 aria-hidden="true" /> Explore services in your city</li>
            <li><CheckCircle2 aria-hidden="true" /> Compare experienced professionals</li>
            <li><CheckCircle2 aria-hidden="true" /> Find the right fit for your needs</li>
          </ul>
        </div>

        <Link to="/" className="auth-story-home">Back to the marketplace <span aria-hidden="true">→</span></Link>
      </aside>

      <div className="auth-panel">
        <div className="auth-form-card">
          <div className="auth-heading">
            <span className="auth-heading-icon"><ShieldCheck aria-hidden="true" /></span>
            <p className="auth-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="auth-description">{description}</p>
          </div>

          {children}
          {footer}
        </div>
        <p className="auth-privacy-note"><ShieldCheck aria-hidden="true" /> Passwords are not saved in this frontend preview.</p>
      </div>
    </div>
  </section>
);
