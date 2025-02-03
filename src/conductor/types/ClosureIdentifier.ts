import type { Identifier } from "./Identifier";

/** An identifier for an extern closure. */
export type ClosureIdentifier = Identifier & { __brand: "closure" }; // apply branding so it's harder to mix identifiers up
