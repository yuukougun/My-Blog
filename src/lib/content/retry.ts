type RetryOptions = {
  maxAttempts?: number;
  initialDelayMs?: number;
};

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 300;

  let attempt = 0;
  let currentDelay = initialDelayMs;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt += 1;

      if (attempt >= maxAttempts) {
        break;
      }

      await delay(currentDelay);
      currentDelay *= 2;
    }
  }

  throw lastError;
}
