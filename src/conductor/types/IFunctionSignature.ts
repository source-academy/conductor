import type { DataType } from "./DataType";

export interface IFunctionSignature {
    /** The name of this function or closure. */
    name?: string;

    /**
     * The parameter types of this function or closure.
     * If this property not being inferred properly as a tuple, use `as const` after the array declaration.
     */
    args: readonly DataType[];

    /** The type of the return value from this function or closure. */
    returnType: DataType;
}
