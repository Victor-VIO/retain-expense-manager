import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

const ICONS: Record<ToastKind, string> = {
  success: 'check-circle-fill',
  error: 'exclamation-circle-fill',
  info: 'info-circle-fill',
};

const ToastContext = createContext<((message: string, kind?: ToastKind) => void) | null>(null);

// Small confirmation messages ("Expense added") that fade out on their own.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((message: string, kind: ToastKind = 'success') => {
    setToasts((list) => [...list, { id: Date.now() + Math.random(), message, kind }]);
  }, []);

  const remove = (id: number) => setToasts((list) => list.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <ToastContainer className="app-toasts" position="bottom-center">
        {toasts.map((t) => (
          <Toast key={t.id} onClose={() => remove(t.id)} delay={3200} autohide className={`app-toast toast-${t.kind}`}>
            <Toast.Body className="d-flex align-items-center gap-2">
              <i className={`bi bi-${ICONS[t.kind]}`} aria-hidden />
              <span className="flex-grow-1">{t.message}</span>
              <button type="button" className="btn-close btn-close-white ms-2" aria-label="Close" onClick={() => remove(t.id)} />
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
