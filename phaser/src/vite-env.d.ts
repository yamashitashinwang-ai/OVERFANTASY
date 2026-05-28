/// <reference types="vite/client" />

interface Window {
  __state?: unknown;
  __runtime?: unknown;
  __game?: unknown;
  __api?: Record<string, unknown>;
  __dumpLogs?: (limit?: number) => string;
  __clearLogs?: () => void;
  __setLogPattern?: (pattern: string) => void;
}
