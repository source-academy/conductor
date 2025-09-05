import type { DataType } from "./DataType";

export interface IFunctionSignature<Arg extends readonly DataType[], Ret extends DataType> {
    /** The name of this function or closure. */
    name?: string;

    /** The parameter types of this function or closure. */
    args: Arg;

    /** The type of the return value from this function or closure. */
    returnType: Ret;
}
