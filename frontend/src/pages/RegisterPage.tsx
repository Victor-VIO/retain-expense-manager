import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/budget', { replace: true, state: { welcome: true } });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <Card className="auth-card">
        <Card.Body className="p-4">
          <h1 className="h4 mb-1">Create your account</h1>
          <p className="text-muted mb-4">Start tracking expenses and set a budget for the month.</p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Full name</Form.Label>
              <Form.Control value={form.name} onChange={update('name')} autoComplete="name" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={form.email} onChange={update('email')} autoComplete="email" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={form.password}
                onChange={update('password')}
                autoComplete="new-password"
                required
              />
              <Form.Text>At least 6 characters.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-4" controlId="confirm">
              <Form.Label>Confirm password</Form.Label>
              <Form.Control
                type="password"
                value={form.confirm}
                onChange={update('confirm')}
                autoComplete="new-password"
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Sign up'}
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0 small">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
