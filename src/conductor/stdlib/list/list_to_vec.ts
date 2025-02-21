import { EvaluatorTypeError } from "../../../common/errors";
import { DataType, ExternValue, IDataHandler, List, PairIdentifier } from "../../types";

export function list_to_vec(this: IDataHandler, xs: List): [ExternValue, DataType][] {
    const vec: [ExternValue, DataType][] = [];
    if (xs === null) return vec;
    while (true) {
        vec.push([this.pair_gethead(xs), this.pair_typehead(xs)]);
        const t = this.pair_typetail(xs);
        if (t === DataType.EMPTY_LIST) return vec;
        if (t !== DataType.PAIR) throw new EvaluatorTypeError("Input is not a list", DataType[DataType.LIST], DataType[t]);
        xs = this.pair_gettail(xs) as PairIdentifier;
    }
}
