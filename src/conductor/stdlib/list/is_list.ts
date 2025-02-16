import { DataType, IDataHandler, List, PairIdentifier } from "../../types"

/**
 * Checks if a List is a true list (`tail(tail...(xs))` is empty-list).
 * @param xs The List to check.
 * @returns true if the provided List is a true list.
 */
export function is_list(this: IDataHandler, xs: List): boolean {
    if (xs === null) return true; // TODO: figure out some way to avoid JS value comparison
    while (true) {
        const t = this.pair_typetail(xs);
        if (t === DataType.EMPTY_LIST) return true;
        if (t !== DataType.PAIR) return false;
        xs = this.pair_gettail(xs) as PairIdentifier;
    }
}
