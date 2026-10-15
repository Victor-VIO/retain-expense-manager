import { useCallback, useEffect, useState } from 'react';
import { categoryApi } from '../api';
import { getErrorMessage } from '../api/client';
import type { Category } from '../types';

// Loads the category list once; `reload` refetches (used after admin edits).
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      setCategories(await categoryApi.list());
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { categories, loading, error, reload };
}
