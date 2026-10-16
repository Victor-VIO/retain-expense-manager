import { useState, type ChangeEvent } from 'react';
import { Form } from 'react-bootstrap';

interface Props {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  placeholder?: string;
  isInvalid?: boolean;
}

// Password box with a lock icon and a show/hide button.
export default function PasswordInput({ id, value, onChange, autoComplete, placeholder, isInvalid }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-icon">
      <i className="bi bi-lock" aria-hidden />
      <Form.Control
        id={id}
        type={visible ? 'text' : 'password'}
        className="has-toggle"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        isInvalid={isInvalid}
        required
      />
      <button
        type="button"
        className="toggle-pw"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        <i className={`bi bi-${visible ? 'eye-slash' : 'eye'}`} aria-hidden />
      </button>
    </div>
  );
}
