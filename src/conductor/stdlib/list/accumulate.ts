import { ClosureIdentifier, DataType, ExternTypeOf, IDataHandler, List } from "../../types"

/**
 * Accumulates a Closure over a List.
 * 
 * The Closure is applied in a right-to-left order - the first application
 * will be on the last element of the list and the given initial value.
 * @param op The Closure to use as an accumulator over the List.
 * @param initial The initial value (that is, the result of accumulating an empty List).
 * @param sequence The List to be accumulated over.
 * @param resultType The (expected) type of the result.
 * @returns The result of accumulating the Closure over the List.
 */
export function accumulate<T extends Exclude<DataType, DataType.VOID>>(this: IDataHandler, op: ClosureIdentifier<DataType>, initial: ExternTypeOf<T>, sequence: List, resultType: T): ExternTypeOf<T> {
    // Use CPS to prevent stack overflow
    const $accumulate = (xs: List, cont: (each: ExternTypeOf<T>) => ExternTypeOf<T>): ExternTypeOf<T> => {
        if (xs === null) return cont(initial);
        this.pair_assert(xs, undefined, DataType.LIST);
        return $accumulate(this.pair_gettail(xs) as List,
            x => cont(this.closure_call(op, [this.pair_gethead(xs), x], resultType)));
    }

    return $accumulate(sequence, x => x);
}
