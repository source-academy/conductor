import type { DataType } from "./DataType";

export interface IFunctionSignature {
    name?: string;
    args: DataType[];
    returnType: DataType;
}
