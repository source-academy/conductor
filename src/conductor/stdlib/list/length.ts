import { EvaluatorTypeError } from "../../../common/errors";
import { DataType, IDataHandler, List, PairIdentifier } from "../../types"

/**
 * Gets the length of a List.
 * @param xs The List to get the length of.
 * @returns The length of the List.
 */
export function length(this: IDataHandler, xs: List): number {
    let length = 0;
    if (xs === null) return length; // TODO: figure out some way to avoid JS value comparison
    while (true) {
        length++;
        const t = this.pair_typetail(xs);
        if (t === DataType.EMPTY_LIST) return length;
        if (t !== DataType.PAIR) throw new EvaluatorTypeError("Input is not a list", DataType[DataType.LIST], DataType[t]);
        xs = this.pair_gettail(xs) as PairIdentifier;
    }
}
