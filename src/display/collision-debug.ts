// Optional collision/range overlay compatibility facade. This is display-only:
// it reads current bodies, object ranges, pickup ranges, and map exit zones but
// never creates or changes gameplay collision.

export { initCollisionDebug, syncCollisionDebug } from './collision-debug/lifecycle.ts';
