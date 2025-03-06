import { EvaluatorTypeError } from "../../../common/errors";
import { DataType, IDataHandler, PairIdentifier } from "../../types";
import { isSameType } from "../../util";

export function pair_assert(this: IDataHandler, p: PairIdentifier, headType?: DataType, tailType?: DataType): void {
    if (headType) {
        const t = this.pair_typehead(p);
        if (!isSameType(t, headType)) throw new EvaluatorTypeError("Pair head assertion failure", DataType[headType], DataType[t]);
    }
    if (tailType) {
        const t = this.pair_typetail(p);
        if (!isSameType(t, tailType)) throw new EvaluatorTypeError("Pair tail assertion failure", DataType[tailType], DataType[t]);
    }
}
