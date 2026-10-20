import { useCallback, useEffect, useState } from 'react';

const keyFor = (kind) => `alveoly_history_${kind}`;

export function useHistory(kind) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(keyFor(kind));
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [kind]);

  const persist = useCallback(
    (next) => {
      setItems(next);
      try {
        localStorage.setItem(keyFor(kind), JSON.stringify(next.slice(0, 50)));
      } catch {
        /* ignore quota */
      }
    },
    [kind]
  );

  const add = useCallback(
    (item) => {
      persist([{ ...item, createdAt: Date.now() }, ...items]);
    },
    [items, persist]
  );

  const remove = useCallback(
    (id) => {
      persist(items.filter((x) => x.id !== id));
    },
    [items, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { items, add, remove, clear };
}