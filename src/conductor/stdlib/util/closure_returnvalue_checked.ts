import { DataType, IDataHandler, ReturnValue, ExternTypeOf } from "../../types";

export function closure_returnvalue_checked<T extends DataType>(this: IDataHandler, rv: ReturnValue<any>, type: T): ExternTypeOf<T> {
    this.closure_returntype_assert(rv, type);
    return rv[0];
}
