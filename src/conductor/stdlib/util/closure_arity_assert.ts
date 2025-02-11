import { EvaluatorTypeError } from "../../../common/errors";
import { IDataHandler, ClosureIdentifier } from "../../types";

function closure_arity_assert(this: IDataHandler, c: ClosureIdentifier, arity: number): boolean {
    const a = this.closure_arity(c);
    if (a !== arity) throw new EvaluatorTypeError("Closure arity assertion failure", String(arity), String(a));
    return true;
}
