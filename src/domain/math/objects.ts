export function clonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function replaceObject<T extends object>(target: T, source: T) {
  const writableTarget = target as Record<string, unknown>;
  for (const key of Object.keys(target)) delete writableTarget[key];
  Object.assign(target, clonePlain(source));
}
