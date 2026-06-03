import { facingDirs } from "../../../domain/facing.ts";
import type { FacingDir } from "../../../domain/facing.ts";

export function isRigFacingDir(value: unknown): value is FacingDir {
  return typeof value === "string" && facingDirs.includes(value as FacingDir);
}
