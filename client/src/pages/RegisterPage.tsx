import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { useApp } from '../context/AppContext';
import { INDIAN_CITIES } from '../data/mockData';
import { postJson, setAuthToken } from '../utils/api';
import type { User } from '../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentUser, isFirebaseConnected } = useApp();

  const initialRole = searchParams.get('role') === 'provider' ? 'provider' : 'customer';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'customer' | 'provider'>(initialRole);
  const [city, setCity] = useState('Jaipur');
  const [category, setCategory] = useState('EDUCATION');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const sendVerificationCode = async () => {
    setError('');
    setStatus('');

    if (!isFirebaseConnected) {
      setStatus('Registration is not connected yet. Your details were not sent or saved. Reconnect the backend to enable account creation.');
      return;
    }

    setIsSubmitting(true);
    const requestController = new AbortController();
    const requestTimeout = window.setTimeout(() => requestController.abort(), 25000);
    try {
      const result = await postJson<{ message: string }>('/api/auth/register/request-otp', {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        city,
        mobile: mobile.trim(),
        category
      }, { signal: requestController.signal });
      setOtpSent(true);
      setStatus(result.message);
    } catch (registrationError) {
      setError(registrationError instanceof DOMException && registrationError.name === 'AbortError'
        ? 'The request timed out while sending the email. Please try again in a moment.'
        : registrationError instanceof Error ? registrationError.message : 'Could not send the verification code. Please try again.');
    } finally {
      window.clearTimeout(requestTimeout);
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!otpSent && password !== confirmPassword) {
      setError('Passwords do not match. Please check them and try again.');
      return;
    }

    if (!otpSent) {
      await sendVerificationCode();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await postJson<{ user: User; token: string }>('/api/auth/register/verify-otp', {
        email: email.trim(),
        otp
      });
      setAuthToken(result.token);
      setCurrentUser(result.user);
      navigate(role === 'provider' ? '/provider/dashboard' : '/customer/dashboard');
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : 'Could not verify your email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageLayout
      eyebrow="Join the community"
      title="Create your account"
      description="Choose how you’d like to use Digital Vistara. You can discover services or offer your skills."
      footer={(
        <div className="auth-form-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      )}
    >
      {!isFirebaseConnected && (
        <div className="auth-backend-notice" role="note">
          Backend authentication is currently offline. You can preview this form, but account creation will be enabled when the backend is restored.
        </div>
      )}

      <form onSubmit={handleRegister} className="auth-form">
        {!otpSent ? (
          <>
        <div className="auth-role-switch" aria-label="Account type">
          <button
            type="button"
            onClick={() => setRole('customer')}
            aria-pressed={role === 'customer'}
          >
            I’m a customer
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            aria-pressed={role === 'provider'}
          >
            I’m a professional
          </button>
        </div>

        <div className="auth-field">
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Ramesh Chandra"
            autoComplete="name"
            minLength={2}
            maxLength={80}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-mobile">Mobile number</label>
          <input
            id="register-mobile"
            type="tel"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            placeholder="+91 98290 00000"
            autoComplete="tel"
            inputMode="tel"
            maxLength={18}
            title="Enter a 10-digit Indian mobile number or an international number with its +country code."
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="register-password">Password</label>
          <div className="auth-password-wrap">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-confirm-password">Confirm password</label>
          <div className="auth-password-wrap">
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter your password again"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-city">City</label>
          <select id="register-city" value={city} onChange={(event) => setCity(event.target.value)} required>
            {INDIAN_CITIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        {role === 'provider' && (
          <div className="auth-field">
            <label htmlFor="register-category">Service category</label>
            <select id="register-category" value={category} onChange={(event) => setCategory(event.target.value)} required>
              <option value="EDUCATION">Education</option>
              <option value="HEALTHCARE">Healthcare</option>
              <option value="DIGITAL MARKETING & IT">Digital Marketing &amp; IT</option>
              <option value="HOME SERVICES">Home Services</option>
              <option value="EVENT MANAGEMENT">Event Management</option>
            </select>
          </div>
        )}
          </>
        ) : (
          <>
            <p className="auth-description">
              Enter the 6-digit code sent to <strong>{email.trim()}</strong> to finish creating your account.
            </p>
            <div className="auth-field">
              <label htmlFor="register-otp">Verification code</label>
              <input
                id="register-otp"
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
              />
            </div>
            <div className="auth-otp-actions">
              <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); setStatus(''); }}>
                Back to registration
              </button>
              <button type="button" onClick={() => void sendVerificationCode()} disabled={isSubmitting}>
                Resend code
              </button>
            </div>
          </>
        )}

        {error && <p className="auth-message" role="alert">{error}</p>}
        {status && <p className="auth-message" role="status">{status}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          <span>
            {isSubmitting
              ? (otpSent ? 'Verifying code…' : 'Sending code…')
              : (otpSent ? 'Verify code and create account' : 'Send verification code')}
          </span>
          {!isSubmitting && <ArrowRight aria-hidden="true" />}
        </button>
      </form>
    </AuthPageLayout>
  );
};
