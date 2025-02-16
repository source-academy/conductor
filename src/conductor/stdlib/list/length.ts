import { DataType, IDataHandler, List, PairIdentifier } from "../../types"

/**
 * Gets the length of a List.
 * @param xs The List to get the length of.
 * @returns The length of the List.
 */
export function length(this: IDataHandler, xs: List): number {
    if (!this.is_list(xs)) {
      throw new Error('length(xs) expects a list');
    }
    if (xs === null) return 0; // TODO: figure out some way to avoid JS value comparison
    let length = 1;
    while (true) {
        const t = this.pair_typetail(xs);
        if (t === DataType.EMPTY_LIST) return length;
        xs = this.pair_gettail(xs) as PairIdentifier;
        length++;
    }
}
