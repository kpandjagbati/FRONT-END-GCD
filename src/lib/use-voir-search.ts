"use client";

import { useCallback, useState } from "react";

export function useVoirSearch<T>(search: () => Promise<T[]>) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<T[] | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    try {
      setResults(await search());
    } finally {
      setLoading(false);
    }
  }, [search]);

  const reset = useCallback(() => {
    setResults(null);
  }, []);

  return { loading, results, run, reset };
}
