import { useCallback, useState } from "react";

export function useAsyncAction() {
  const [pendingKeys, setPendingKeys] = useState<Record<string, boolean>>({});

  const runAction = useCallback(async <T,>(key: string, task: () => Promise<T>) => {
    setPendingKeys((current) => ({ ...current, [key]: true }));
    try {
      return await task();
    } finally {
      setPendingKeys((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }, []);

  const isPending = useCallback((key: string) => Boolean(pendingKeys[key]), [pendingKeys]);

  return { runAction, isPending, pendingKeys };
}
