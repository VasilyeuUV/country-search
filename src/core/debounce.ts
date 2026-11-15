/** @file Debounce helper. */

/** Debounced wrapper: call it as often as needed, the callback runs once. */
export interface DebouncedFunction<Args extends readonly unknown[]> {
  (...args: Args): void;
  /** Drops a pending call, if any. */
  cancel(): void;
}

/**
 * Delays `callback` until it has not been called for `delayMs`.
 *
 * @param callback - Function to invoke after the idle period.
 * @param delayMs - Idle period in milliseconds.
 * @returns Wrapper exposing a `cancel()` method.
 */
export function debounce<Args extends readonly unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
): DebouncedFunction<Args> {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const cancel = (): void => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerId = undefined;
    }
  };

  return Object.assign(
    (...args: Args): void => {
      cancel();
      timerId = setTimeout(() => {
        timerId = undefined;
        callback(...args);
      }, delayMs);
    },
    { cancel },
  );
}
