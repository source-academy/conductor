import type { Identifier } from "./Identifier";

/** An identifier for an extern array. */
export type ArrayIdentifier = Identifier & { __brand: "array" }; // apply branding so it's harder to mix identifiers up
