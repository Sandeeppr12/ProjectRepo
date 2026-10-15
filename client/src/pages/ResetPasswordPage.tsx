import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { postJson } from '../utils/api';

export const ResetPasswordPage: React.FC = () => {
  const [token, setToken] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check them and try again.');
      return;
    }
    if (password.length < 8) {
      setError('Your new password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await postJson<{ message: string }>('/api/auth/password/reset', { token, password });
      setStatus(result.message);
      setToken('');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not reset your password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetComplete = Boolean(status);
  const hasValidLink = /^[a-f0-9]{64}$/i.test(token);

  return (
    <AuthPageLayout
      eyebrow="Account recovery"
      title={resetComplete ? 'Password updated' : 'Choose a new password'}
      description={resetComplete
        ? 'Your password has been changed. You can now sign in with your new password.'
        : 'Create a new password for your Digital Vistara account.'}
      footer={(
        <div className="auth-form-footer">
          <Link to="/login">Return to sign in</Link>
        </div>
      )}
    >
      {!hasValidLink && !resetComplete && (
        <p className="auth-message" role="alert">
          This reset link is missing or invalid. Request a new link to continue.
        </p>
      )}

      {hasValidLink && !resetComplete && (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-new-password">Confirm new password</label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter your new password again"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && <p className="auth-message" role="alert">{error}</p>}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Updating password…' : 'Update password'}</span>
            {!isSubmitting && <ArrowRight aria-hidden="true" />}
          </button>
        </form>
      )}
    </AuthPageLayout>
  );
};
