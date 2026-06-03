import type { E2eProbe } from './types.ts';

type E2eReporter = Pick<E2eProbe, 'log' | 'ok' | 'fail' | 'step'>;

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function createE2eReporter(errors: string[], failures: string[]): E2eReporter {
  const log = (...args: unknown[]) => console.log(...args);
  const fail = (message: string) => {
    console.log('  ✗', message);
    failures.push(message);
  };
  const ok = (message: string) => console.log('  ✓', message);

  const step = async (label: string, fn: () => Promise<void>) => {
    errors.length = 0;
    log('\n▶', label);
    try {
      await fn();
    } catch (error) {
      fail(`${label} threw: ${toMessage(error)}`);
    }
    if (errors.length) {
      fail(`${label}: ${errors.length} errors`);
      errors.slice(0, 2).forEach(e => log('     →', e));
    }
  };

  return { log, ok, fail, step };
}
