import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { useApp } from '../context/AppContext';
import { postJson } from '../utils/api';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { isFirebaseConnected } = useApp();
  const isAdminReset = searchParams.get('role') === 'admin';
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!isFirebaseConnected) {
      setError('Password reset is unavailable while the backend is offline. Please try again later.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await postJson<{ message: string }>('/api/auth/password/request-reset', {
        email: email.trim()
      });
      setStatus(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not request a reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageLayout
      eyebrow="Account recovery"
      title="Forgot your password?"
      description="Enter the email address associated with your account. If it matches, we’ll send you a secure reset link."
      footer={(
        <div className="auth-form-footer">
          Remembered your password? <Link to={isAdminReset ? '/login?role=admin' : '/login'}>Sign in</Link>
        </div>
      )}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="reset-request-email">Email address</label>
          <input
            id="reset-request-email"
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

        {error && <p className="auth-message" role="alert">{error}</p>}
        {status && <p className="auth-message" role="status">{status}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          <span>{isSubmitting ? 'Sending link…' : 'Send reset link'}</span>
          {!isSubmitting && <ArrowRight aria-hidden="true" />}
        </button>
      </form>
    </AuthPageLayout>
  );
};
