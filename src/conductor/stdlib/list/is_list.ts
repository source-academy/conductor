import { DataType, IDataHandler, List, PairIdentifier } from "../../types"

export function is_list(this: IDataHandler, xs: List): boolean {
    if (xs === null) return true;
    while (true) {
        const t = this.pair_typetail(xs);
        if (t === DataType.EMPTY_LIST) return true;
        if (t !== DataType.PAIR) return false;
        xs = this.pair_gettail(xs) as PairIdentifier;
    }
}
