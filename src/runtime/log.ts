// Structured logging compatibility facade. Namespace definitions, ring-buffer
// storage, debug logger cache, and debug-pattern helpers live under
// `runtime/log/` by responsibility.

export { ROOT, NAMESPACES, NS } from './log/namespaces.ts';
export { log } from './log/logger.ts';
export { dumpLogs, clearLogs } from './log/buffer.ts';
export { setLogPattern, enableDefaultPattern } from './log/pattern.ts';
export type { LogArg, BufferedLogEntry } from './log/types.ts';
