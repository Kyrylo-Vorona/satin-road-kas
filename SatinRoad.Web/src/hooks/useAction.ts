import { useRef, useState } from 'react';
import { errorMessage } from '../types';

export function useAction(onRefresh: () => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const running = useRef(false);

  async function perform(
    action: () => Promise<{ message?: string }>,
    success: string,
    onSuccess?: () => void,
    useServerMessage = true,
  ) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await action();
      onSuccess?.();
      setMessage((useServerMessage && result?.message) || success);
      await onRefresh();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  return { busy, error, message, setError, setMessage, perform };
}
