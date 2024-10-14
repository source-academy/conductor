import type Identifier from "./Identifier";

/** An identifier for an extern closure. */
type ClosureIdentifier = Identifier & { __brand: "closure" }; // apply branding so it's harder to mix identifiers up

export type { ClosureIdentifier as default };
