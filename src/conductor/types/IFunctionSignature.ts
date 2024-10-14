import type DataType from "./DataType";

interface IFunctionSignature {
    name?: string;
    args: DataType[];
    returnValue: DataType;
}

export type { IFunctionSignature as default };
