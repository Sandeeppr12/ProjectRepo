import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { useApp } from '../context/AppContext';
import { postJson, setAuthToken } from '../utils/api';
import type { User } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentUser, isFirebaseConnected } = useApp();
  const isAdminLogin = searchParams.get('role') === 'admin';
  const requestedReturnTo = searchParams.get('returnTo');
  const returnTo = requestedReturnTo?.startsWith('/') && !requestedReturnTo.startsWith('//')
    ? requestedReturnTo
    : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!isFirebaseConnected) {
      setStatus('Sign-in is not connected yet. Your details were not sent or saved. Reconnect the backend to enable account access.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await postJson<{ user: User; token: string }>('/api/auth/login', {
        email: email.trim(),
        password
      });
      if (isAdminLogin && result.user.role !== 'admin') {
        setError('This account does not have administrator access.');
        return;
      }
      setAuthToken(result.token);
      setCurrentUser(result.user);
      navigate(result.user.role === 'customer' && returnTo
        ? returnTo
        : result.user.role === 'admin' ? '/admin/dashboard' : result.user.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageLayout
      eyebrow={isAdminLogin ? 'Administrator access' : 'Welcome back'}
      title={isAdminLogin ? 'Admin sign in' : 'Sign in to your account'}
      description={isAdminLogin
        ? 'Sign in with your authorized administrator account to manage Digital Vistara.'
        : 'Continue to your customer or professional account.'}
      footer={(
        <div className="auth-form-footer">
          {isAdminLogin
            ? <>Not an administrator? <Link to="/login">Go to regular sign in</Link></>
            : <>New to Digital Vistara? <Link to={returnTo ? `/register?returnTo=${encodeURIComponent(returnTo)}` : '/register'}>Create an account</Link></>}
        </div>
      )}
    >
      {!isFirebaseConnected && (
        <div className="auth-backend-notice" role="note">
          {isAdminLogin
            ? 'Admin authentication is unavailable while the backend is offline. Restore the backend to sign in securely.'
            : 'Backend authentication is currently offline. You can preview this form, but sign-in will be enabled when the backend is restored.'}
        </div>
      )}

      <form onSubmit={handleLogin} className="auth-form">
        <div className="auth-field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
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
          <label htmlFor="login-password">Password</label>
          <div className="auth-password-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
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

        <div className="auth-form-footer">
          <Link to={isAdminLogin ? '/forgot-password?role=admin' : '/forgot-password'}>
            Forgot your password?
          </Link>
        </div>

        {error && <p className="auth-message" role="alert">{error}</p>}
        {status && <p className="auth-message" role="status">{status}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          <span>{isSubmitting ? 'Signing in…' : 'Sign in'}</span>
          {!isSubmitting && <ArrowRight aria-hidden="true" />}
        </button>
      </form>
    </AuthPageLayout>
  );
};
