import { EvaluatorTypeError } from "../../../common/errors";
import { DataType, IDataHandler, ReturnValue } from "../../types";
import { isSameType } from "../../util";

function closure_returntype_assert<T extends DataType>(this: IDataHandler, rv: ReturnValue<any>, type: T): asserts rv is ReturnValue<T> {
    const [_returnValue, returnType] = rv;
    if (isSameType(returnType, type)) throw new EvaluatorTypeError("Closure return type assertion failure", DataType[type], DataType[returnType]);
}
