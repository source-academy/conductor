import type { DataType } from "./DataType";
import type { TypedValue } from "./TypedValue";

type DataTypeMap<T extends readonly [...DataType[]]> = {
    [Idx in keyof T]: TypedValue<T[Idx]>
};

export type ExternCallable<Arg extends readonly DataType[], Ret extends DataType> = (...args: DataTypeMap<Arg>) => TypedValue<Ret> | Promise<TypedValue<Ret>>;
