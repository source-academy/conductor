import type Identifier from "./Identifier";

/** An identifier for an extern opaque value. */
type OpaqueIdentifier = Identifier & { __brand: "opaque" }; // apply branding so it's harder to mix identifiers up

export type { OpaqueIdentifier as default };
