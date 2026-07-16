import { EvaluatorParameterTypeError } from "./EvaluatorParameterTypeError";

export interface NumberRangeOptions {
    /** Minimum allowable value (inclusive). Omit to not perform a minimum check. Ignored if `minExclusive` is set. */
    min?: number;
    /** Maximum allowable value (inclusive). Omit to not perform a maximum check. Ignored if `maxExclusive` is set. */
    max?: number;
    /** Minimum allowable value (exclusive) - rejects `value === minExclusive`. Takes precedence over `min` if both are set. */
    minExclusive?: number;
    /** Maximum allowable value (exclusive) - rejects `value === maxExclusive`. Takes precedence over `max` if both are set. */
    maxExclusive?: number;
    /** `true` by default. Set to `false` to allow non-integer values. */
    integer?: boolean;
}

function describeNumberRange(options: NumberRangeOptions | string): string {
    if (typeof options === "string") return options;
    const { min, max, minExclusive, maxExclusive, integer = true } = options;
    const type = integer ? "integer" : "number";
    const lo = minExclusive ?? min;
    const hi = maxExclusive ?? max;
    if (lo !== undefined && hi !== undefined) {
        const open = minExclusive !== undefined ? "(" : "[";
        const close = maxExclusive !== undefined ? ")" : "]";
        return `${type} ∈ ${open}${lo}, ${hi}${close}`;
    }
    if (lo !== undefined) return `${type} ${minExclusive !== undefined ? ">" : "≥"} ${lo}`;
    if (hi !== undefined) return `${type} ${maxExclusive !== undefined ? "<" : "≤"} ${hi}`;
    return type;
}

/**
 * Evaluator number range error - a module function received a number outside its accepted
 * range, or a non-integer where an integer was required.
 */
export class EvaluatorNumberRangeError extends EvaluatorParameterTypeError {
    override name = "EvaluatorNumberRangeError";

    constructor(value: unknown, options: NumberRangeOptions | string, funcName: string, paramName?: string, line?: number, column?: number, fileName?: string) {
        super(funcName, paramName, describeNumberRange(options), value, line, column, fileName);
    }
}
