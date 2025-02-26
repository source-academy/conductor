import { EvaluatorTypeError } from "../../../common/errors";
import { HeapDataType, type HeapIdentifier, type ITypedValue } from "../types";

export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType.ARRAY): asserts value is {value: HeapIdentifier, datatype: HeapDataType.ARRAY};
export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType.BOOLEAN): asserts value is {value: boolean, datatype: HeapDataType.BOOLEAN};
export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType.CLOSURE): asserts value is {value: HeapIdentifier, datatype: HeapDataType.CLOSURE};
export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType.CONST_STRING): asserts value is {value: string, datatype: HeapDataType.CONST_STRING};
export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType.EMPTY_LIST): asserts value is {value: null, datatype: HeapDataType.EMPTY_LIST};
export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType.FRAME): asserts value is {value: HeapIdentifier, datatype: HeapDataType.FRAME};
export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType.NUMBER): asserts value is {value: number, datatype: HeapDataType.NUMBER};
export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType.OPAQUE): asserts value is {value: HeapIdentifier, datatype: HeapDataType.OPAQUE};
export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType.PAIR): asserts value is {value: HeapIdentifier, datatype: HeapDataType.PAIR};
export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType.UNASSIGNED): asserts value is {value: undefined, datatype: HeapDataType.UNASSIGNED};
export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType): void;
export function assertDataType(message: string, value: ITypedValue, expected: HeapDataType) {
    if (value.datatype !== expected) {
        throw new EvaluatorTypeError(message, HeapDataType[expected], HeapDataType[value.datatype]);
    }
}
