"use client";

import { useCallback, useState } from "react";

export function useVoirSearch<T>(search: () => Promise<T[]>) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResults(await search());
    } catch (cause) {
      setResults(null);
      setError(cause instanceof Error ? cause.message : "La recherche n'a pas abouti. Vérifiez la connexion et réessayez.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { loading, results, error, run, reset };
}
