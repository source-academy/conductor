import { DataType } from "../../../../conductor/types";
import { HeapDataType } from "./HeapDataType";

export const dtMap = {
    [HeapDataType.ARRAY]: DataType.ARRAY,
    [HeapDataType.BOOLEAN]: DataType.BOOLEAN,
    [HeapDataType.CLOSURE]: DataType.CLOSURE,
    [HeapDataType.CONST_STRING]: DataType.CONST_STRING,
    [HeapDataType.EMPTY_LIST]: DataType.EMPTY_LIST,
    [HeapDataType.FRAME]: DataType.VOID,
    [HeapDataType.LIST]: DataType.LIST,
    [HeapDataType.NUMBER]: DataType.NUMBER,
    [HeapDataType.OPAQUE]: DataType.OPAQUE,
    [HeapDataType.PAIR]: DataType.PAIR,
    [HeapDataType.UNASSIGNED]: DataType.VOID,
} as const;

export const hdtMap = {
    [DataType.ARRAY]: HeapDataType.ARRAY,
    [DataType.BOOLEAN]: HeapDataType.BOOLEAN,
    [DataType.CLOSURE]: HeapDataType.CLOSURE,
    [DataType.CONST_STRING]: HeapDataType.CONST_STRING,
    [DataType.EMPTY_LIST]: HeapDataType.EMPTY_LIST,
    [DataType.LIST]: HeapDataType.LIST,
    [DataType.NUMBER]: HeapDataType.NUMBER,
    [DataType.OPAQUE]: HeapDataType.OPAQUE,
    [DataType.PAIR]: HeapDataType.PAIR,
    [DataType.VOID]: HeapDataType.UNASSIGNED,
} as const;
