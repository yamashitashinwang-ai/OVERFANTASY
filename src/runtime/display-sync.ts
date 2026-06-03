import type { ActorState } from '../domain/types.ts';

export type ActorTeleporter = (actor: ActorState | null | undefined) => void;
export type DisplayRebuilder = () => void;

const noopActorTeleporter: ActorTeleporter = () => undefined;
const noopDisplayRebuilder: DisplayRebuilder = () => undefined;

let actorTeleporter: ActorTeleporter = noopActorTeleporter;
let displayRebuilder: DisplayRebuilder = noopDisplayRebuilder;

export function registerActorTeleporter(teleporter: ActorTeleporter | null | undefined) {
  actorTeleporter = teleporter || noopActorTeleporter;
}

export function resetActorTeleporter() {
  actorTeleporter = noopActorTeleporter;
}

export function teleportActorBody(actor: ActorState | null | undefined) {
  actorTeleporter(actor);
}

export function registerDisplayRebuilder(rebuilder: DisplayRebuilder | null | undefined) {
  displayRebuilder = rebuilder || noopDisplayRebuilder;
}

export function resetDisplayRebuilder() {
  displayRebuilder = noopDisplayRebuilder;
}

export function rebuildDisplayIfRegistered() {
  displayRebuilder();
}
