import type { ArrayIdentifier, ClosureIdentifier, Identifier, NativeValue, OpaqueIdentifier, PairIdentifier } from ".";

/** A valid extern value. */
type ExternValue = NativeValue | Identifier | PairIdentifier | ArrayIdentifier | ClosureIdentifier | OpaqueIdentifier;

export type { ExternValue as default };
