export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function choice<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
