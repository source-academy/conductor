import { DataType, IDataHandler, ReturnValue, ExternTypeOf } from "../../types";

export function closure_returnvalue<T extends DataType>(this: IDataHandler, rv: ReturnValue<T>): ExternTypeOf<T> {
    return rv[0];
}
