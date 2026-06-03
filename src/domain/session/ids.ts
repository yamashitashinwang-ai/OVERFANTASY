export function makeRuntimeId(prefix = 'id'): string {
  const safePrefix = String(prefix).replace(/[^a-zA-Z0-9:_-]/g, '_');
  return `${safePrefix}:${Date.now().toString(36)}:${Math.floor(Math.random() * 0xffffff).toString(36)}`;
}
