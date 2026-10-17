import { useState, type FormEvent } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import AuthLayout from '../components/layout/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  usePageTitle('Sign in');
  const { login } = useAuth();
  const notify = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // GuestRoute redirects once the user is set.
      const user = await login(email, password);
      notify(`Welcome back, ${user.name.split(' ')[0]}!`, 'info');
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="mb-1">Welcome back</h1>
      <p className="text-muted mb-4">Sign in to check your spending and budget.</p>

      {error && (
        <Alert variant="danger" className="d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-circle" aria-hidden />
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email address</Form.Label>
          <div className="input-icon">
            <i className="bi bi-envelope" aria-hidden />
            <Form.Control
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label htmlFor="password">Password</Form.Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Your password"
          />
        </Form.Group>
        <Button type="submit" size="lg" className="w-100 fs-6 py-2" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </Form>

      <p className="text-center mt-4 mb-0 small">
        New to Retain? <Link to="/register" className="fw-semibold">Create a free account</Link>
      </p>
    </AuthLayout>
  );
}
