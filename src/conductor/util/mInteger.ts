import { DataType, type TypedValue } from "../types";

export function mInteger(value: bigint): TypedValue<DataType.INTEGER> {
    return {
        type: DataType.INTEGER,
        value
    };
}
