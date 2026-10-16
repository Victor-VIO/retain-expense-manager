import { useState, type FormEvent } from 'react';
import { Alert, Badge, Button, Card, Form, InputGroup, ListGroup } from 'react-bootstrap';
import { categoryApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import type { Category } from '../../types';
import ConfirmModal from '../ConfirmModal';
import { plural } from '../../utils/format';
import { CategoryAvatar } from '../ui';

interface Props {
  categories: Category[];
  onChanged: () => void;
}

// Admin: add, rename and delete expense categories.
export default function CategoryManager({ categories, onChanged }: Props) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Wraps each action with busy state + success/error message.
  const run = async (action: () => Promise<string>) => {
    setBusy(true);
    setMessage(null);
    try {
      const text = await action();
      setMessage({ type: 'success', text });
      onChanged();
      return true;
    } catch (err) {
      setMessage({ type: 'danger', text: getErrorMessage(err) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const ok = await run(async () => {
      const created = await categoryApi.create(newName.trim());
      return `Added "${created.name}".`;
    });
    if (ok) setNewName('');
  };

  const handleRename = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId === null || !editName.trim()) return;
    const ok = await run(async () => {
      const updated = await categoryApi.update(editingId, editName.trim());
      return `Renamed to "${updated.name}".`;
    });
    if (ok) setEditingId(null);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await run(async () => {
      const result = await categoryApi.remove(toDelete.id);
      return `Deleted "${toDelete.name}". ${plural(result.movedExpenses, 'expense')} moved to Uncategorized.`;
    });
    setToDelete(null);
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <h2 className="section-title">Expense categories</h2>
        <p className="text-muted small mb-3">Add, rename or remove the categories people can choose from.</p>
        {message && (
          <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <Form onSubmit={handleCreate} className="mb-3">
          <InputGroup>
            <Form.Control
              placeholder="New category name"
              aria-label="New category name"
              value={newName}
              maxLength={40}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button type="submit" disabled={busy || !newName.trim()}>
              <i className="bi bi-plus-lg me-1" aria-hidden />
              Add
            </Button>
          </InputGroup>
        </Form>

        <ListGroup variant="flush" className="category-list">
          {categories.map((c) => (
            <ListGroup.Item key={c.id} className="px-0 bg-transparent">
              {editingId === c.id ? (
                <Form onSubmit={handleRename}>
                  <InputGroup size="sm">
                    <Form.Control
                      autoFocus
                      aria-label="Category name"
                      value={editName}
                      maxLength={40}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <Button type="submit" disabled={busy}>
                      Save
                    </Button>
                    <Button variant="outline-secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </InputGroup>
                </Form>
              ) : (
                <div className="d-flex align-items-center gap-3">
                  <CategoryAvatar name={c.name} size="sm" />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold text-truncate">
                      {c.name}
                      {c.isDefault && (
                        <Badge bg="secondary" className="ms-2 fw-semibold">
                          default
                        </Badge>
                      )}
                    </div>
                    <div className="small text-muted">{plural(c.expenseCount ?? 0, 'expense')}</div>
                  </div>
                  {!c.isDefault && (
                    <div className="tx-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`Rename ${c.name}`}
                        title="Rename"
                        onClick={() => {
                          setEditingId(c.id);
                          setEditName(c.name);
                        }}
                      >
                        <i className="bi bi-pencil" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="icon-btn text-danger"
                        aria-label={`Delete ${c.name}`}
                        title="Delete"
                        onClick={() => setToDelete(c)}
                      >
                        <i className="bi bi-trash3" aria-hidden />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>

      <ConfirmModal
        show={!!toDelete}
        title="Delete category?"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      >
        <p className="mb-0">
          <strong>{toDelete?.name}</strong> will be removed.
          {toDelete?.expenseCount
            ? ` Its ${plural(toDelete.expenseCount, 'expense')} will be moved to "Uncategorized" so nothing is lost.`
            : ' No expenses use it.'}
        </p>
      </ConfirmModal>
    </Card>
  );
}
