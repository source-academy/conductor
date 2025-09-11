import type { DataType } from "./DataType";
import type { ExternTypeOf } from "./ExternTypeOf";

interface ITypedValue<T extends DataType, U extends DataType = DataType> {
    type: T;
    value: ExternTypeOf<T, U>;
}

// export a type instead to benefit from distributive conditional type
export type TypedValue<T extends DataType, U extends DataType = DataType> = T extends DataType ? T extends DataType.LIST ? ITypedValue<DataType.PAIR> | ITypedValue<DataType.EMPTY_LIST> : ITypedValue<T, U> : never;
