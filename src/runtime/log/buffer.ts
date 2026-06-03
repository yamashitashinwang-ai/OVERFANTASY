import type { BufferedLogEntry, LogArg } from './types.ts';

const BUFFER_MAX = 500;
const buffer: BufferedLogEntry[] = [];

export function bufferPush(ns: string, args: LogArg[]) {
  if (buffer.length >= BUFFER_MAX) buffer.shift();
  buffer.push({
    t: performance.now(),
    ns,
    msg: args[0],
    args: args.slice(1)
  });
}

export function dumpLogs(limit = 200): string {
  const recent = buffer.slice(-limit);
  return recent
    .map(({ t, ns, msg, args }) => {
      const ts = (t / 1000).toFixed(2).padStart(8);
      const rest = args.length
        ? ' ' + args.map((arg: LogArg) => {
            if (arg == null) return String(arg);
            if (typeof arg === 'string') return arg;
            try { return JSON.stringify(arg); } catch { return String(arg); }
          }).join(' ')
        : '';
      return `${ts}s [${ns}] ${msg}${rest}`;
    })
    .join('\n');
}

export function clearLogs() {
  buffer.length = 0;
}
