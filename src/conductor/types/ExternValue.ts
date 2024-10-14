import type { ArrayIdentifier, ClosureIdentifier, Identifier, NativeValue, PairIdentifier } from ".";

/** A valid extern value. */
type ExternValue = NativeValue | Identifier | PairIdentifier | ArrayIdentifier | ClosureIdentifier;

export type { ExternValue as default };
