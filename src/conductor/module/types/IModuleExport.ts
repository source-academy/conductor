import type { DataType, IFunctionSignature, TypedValue } from "../../types";

export interface IModuleExport {
    /** The symbol referencing the export. */
    symbol: string;

    /** The exported value. */
    value: TypedValue<DataType>;

    /** If value is a function, provides its function signature. */
    signature?: IFunctionSignature<any, any>; // TODO: allow richer typing somehow?
}
