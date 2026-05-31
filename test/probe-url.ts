export function probeBaseUrl(defaultPort = 5175) {
  const explicit = process.env.PROBE_BASE_URL;
  if (explicit) return explicit.endsWith('/') ? explicit : `${explicit}/`;
  const port = process.env.PORT || String(defaultPort);
  return `http://localhost:${port}/`;
}
