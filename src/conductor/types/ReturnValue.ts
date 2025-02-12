import { DataType } from "./DataType";
import { ExternTypeOf } from "./ExternTypeOf";

/** The value returned from `closure_call` - a tuple of the actual return value, and its type. */
export type ReturnValue<T extends DataType> = [ExternTypeOf<T>, T];
