import type { ReactNode } from 'react';
import { Button, Modal } from 'react-bootstrap';

interface Props {
  show: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ show, title, children, confirmLabel = 'Delete', busy, onConfirm, onCancel }: Props) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Working...' : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
