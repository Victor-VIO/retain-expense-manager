import { useState, type FormEvent } from 'react';
import { Alert, Badge, Button, Card, Form, InputGroup, ListGroup } from 'react-bootstrap';
import { categoryApi } from '../../api';
import { getErrorMessage } from '../../api/client';
import type { Category } from '../../types';
import ConfirmModal from '../ConfirmModal';

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
      return `Deleted "${toDelete.name}". ${result.movedExpenses} expense(s) moved to Uncategorized.`;
    });
    setToDelete(null);
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="h6 mb-3">Expense categories</Card.Title>
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
              Add
            </Button>
          </InputGroup>
        </Form>

        <ListGroup variant="flush" className="category-list">
          {categories.map((c) => (
            <ListGroup.Item key={c.id} className="px-0">
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
                <div className="d-flex justify-content-between align-items-center gap-2">
                  <span>
                    {c.name}{' '}
                    <span className="text-muted small">· {c.expenseCount ?? 0} expenses</span>
                    {c.isDefault && (
                      <Badge bg="secondary" className="ms-2">
                        default
                      </Badge>
                    )}
                  </span>
                  {!c.isDefault && (
                    <span className="text-nowrap">
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => {
                          setEditingId(c.id);
                          setEditName(c.name);
                        }}
                      >
                        Rename
                      </Button>
                      <Button size="sm" variant="link" className="text-danger" onClick={() => setToDelete(c)}>
                        Delete
                      </Button>
                    </span>
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
            ? ` Its ${toDelete.expenseCount} expense(s) will be moved to "Uncategorized" so nothing is lost.`
            : ' No expenses use it.'}
        </p>
      </ConfirmModal>
    </Card>
  );
}
