import { useCallback, useEffect, useState } from "react";
import { fetchReference } from "../../../api/reference";
import { getErrorMessage } from "../../../api/errors";

export default function useReferenceList(kind) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchReference(kind)
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`Failed to load ${kind}:`, err);
        setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [kind, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { items, error, reload };
}