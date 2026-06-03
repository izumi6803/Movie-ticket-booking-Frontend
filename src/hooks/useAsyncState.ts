"use client";

import { useCallback, useState } from "react";

interface UseOptimisticUpdateOptions<T> {
  onUpdate: (data: T) => Promise<T>;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
}

export function useOptimisticUpdate<T>({
  onUpdate,
  onError,
  onSuccess,
}: UseOptimisticUpdateOptions<T>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (optimisticData: T, actualUpdate: () => Promise<T>) => {
      setIsUpdating(true);
      setError(null);

      try {
        const result = await actualUpdate();
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Update failed");
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [onUpdate, onError, onSuccess]
  );

  return { update, isUpdating, error };
}

export function useAsyncState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (fn: () => Promise<T>) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fn();
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Operation failed");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { data, isLoading, error, execute, reset, setData } as const;
}
