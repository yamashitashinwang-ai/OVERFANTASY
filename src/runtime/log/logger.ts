import createDebug from 'debug';
import { bufferPush } from './buffer.ts';
import type { LogArg } from './types.ts';

const cache = new Map<string, (...args: LogArg[]) => void>();

function getLogger(ns: string): (...args: LogArg[]) => void {
  let logger = cache.get(ns);
  if (!logger) {
    const debug = createDebug(ns) as (...items: LogArg[]) => void;
    logger = (...args: LogArg[]) => {
      // Buffer captures everything for post-hoc dumping, regardless of whether
      // the debug namespace is currently enabled.
      bufferPush(ns, args);
      debug(...args);
    };
    cache.set(ns, logger);
  }
  return logger;
}

export function log(ns: string, ...args: LogArg[]) {
  getLogger(ns)(...args);
}
