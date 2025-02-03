import type { ArrayIdentifier, ClosureIdentifier, Identifier, NativeValue, OpaqueIdentifier, PairIdentifier } from ".";

/** A valid extern value. */
export type ExternValue = NativeValue | Identifier | PairIdentifier | ArrayIdentifier | ClosureIdentifier | OpaqueIdentifier;
