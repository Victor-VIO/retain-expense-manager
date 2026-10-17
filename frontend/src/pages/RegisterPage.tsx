import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import AuthLayout from '../components/layout/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../context/ToastContext';

// 1 = weak, 2 = okay, 3 = strong (0 = nothing typed)
function passwordStrength(pw: string) {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  let score = 1;
  if (pw.length >= 10) score++;
  if (/\d/.test(pw) && /[a-zA-Z]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(3, score);
}
const STRENGTH_LABEL = ['', 'Too weak', 'Okay', 'Strong'];

export default function RegisterPage() {
  usePageTitle('Create account');
  const { register } = useAuth();
  const notify = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const strength = passwordStrength(form.password);
  const mismatch = form.confirm.length > 0 && form.confirm !== form.password;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim()) return setError('Please enter your name and email');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');

    setSubmitting(true);
    try {
      // GuestRoute redirects to the dashboard once the user is set.
      const user = await register(form.name, form.email, form.password);
      notify(`Account created – welcome, ${user.name.split(' ')[0]}!`);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="mb-1">Create your account</h1>
      <p className="text-muted mb-4">It's free and takes less than a minute.</p>

      {error && (
        <Alert variant="danger" className="d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-circle" aria-hidden />
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="name">Full name</Form.Label>
          <div className="input-icon">
            <i className="bi bi-person" aria-hidden />
            <Form.Control id="name" placeholder="e.g. Aline Uwase" value={form.name} onChange={update('name')} autoComplete="name" required />
          </div>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email address</Form.Label>
          <div className="input-icon">
            <i className="bi bi-envelope" aria-hidden />
            <Form.Control
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
              required
            />
          </div>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="password">Password</Form.Label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={update('password')}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
          {strength > 0 && (
            <>
              <div className="pw-meter" aria-hidden>
                {[1, 2, 3].map((n) => (
                  <span key={n} className={n <= strength ? `on-${strength}` : ''} />
                ))}
              </div>
              <div className="small text-muted mt-1">Password strength: {STRENGTH_LABEL[strength]}</div>
            </>
          )}
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label htmlFor="confirm">Confirm password</Form.Label>
          <PasswordInput
            id="confirm"
            value={form.confirm}
            onChange={update('confirm')}
            autoComplete="new-password"
            placeholder="Type it again"
            isInvalid={mismatch}
          />
          {mismatch && <div className="invalid-feedback d-block">Passwords don't match yet</div>}
        </Form.Group>
        <Button type="submit" size="lg" className="w-100 fs-6 py-2" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </Button>
      </Form>

      <p className="text-center mt-4 mb-0 small">
        Already have an account? <Link to="/login" className="fw-semibold">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
