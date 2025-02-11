import type { DataType } from "./DataType";

export interface IFunctionSignature {
    name?: string;
    args: readonly DataType[];
    returnType: DataType;
}
