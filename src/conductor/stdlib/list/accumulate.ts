import { ClosureIdentifier, DataType, ExternTypeOf, IDataHandler, List } from "../../types"

/**
 * Accumulate applies given operation op to elements of a list
 * in a right-to-left order, first apply op to the last element
 * and an initial element, resulting in r1, then to the second-last
 * element and r1, resulting in r2, etc, and finally to the first element
 * and r_n-1, where n is the length of the list. `accumulate(op,zero,list(1,2,3))`
 * results in `op(1, op(2, op(3, zero)))`
 */
export function accumulate<T extends Exclude<DataType, DataType.VOID>>(this: IDataHandler, resultType: T, op: ClosureIdentifier<DataType>, initial: ExternTypeOf<T>, sequence: List): ExternTypeOf<T> {
    // Use CPS to prevent stack overflow
    const $accumulate = (xs: List, cont: (each: ExternTypeOf<T>) => ExternTypeOf<T>): ExternTypeOf<T> => {
        if (xs === null) return cont(initial);
        this.pair_assert(xs, undefined, DataType.LIST);
        return $accumulate(this.pair_gettail(xs) as List,
            x => cont(this.closure_call(op, [this.pair_gethead(xs), x], resultType)));
    }

    return $accumulate(sequence, x => x);
}
