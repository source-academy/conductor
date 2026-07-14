import { EvaluatorParameterTypeError } from "./EvaluatorParameterTypeError";

export interface NumberRangeOptions {
    /** Minimum allowable value. Inclusive unless `minExclusive` is set. Omit to not perform a minimum check. */
    min?: number;
    /** Maximum allowable value. Inclusive unless `maxExclusive` is set. Omit to not perform a maximum check. */
    max?: number;
    /** `false` by default. Set to `true` to reject `value === min`. Has no effect if `min` is omitted. */
    minExclusive?: boolean;
    /** `false` by default. Set to `true` to reject `value === max`. Has no effect if `max` is omitted. */
    maxExclusive?: boolean;
    /** `true` by default. Set to `false` to allow non-integer values. */
    integer?: boolean;
}

function describeNumberRange(options: NumberRangeOptions | string): string {
    if (typeof options === "string") return options;
    const { min, max, minExclusive = false, maxExclusive = false, integer = true } = options;
    const type = integer ? "integer" : "number";
    if (min !== undefined && max !== undefined) {
        const open = minExclusive ? "(" : "[";
        const close = maxExclusive ? ")" : "]";
        return `${type} ∈ ${open}${min}, ${max}${close}`;
    }
    if (min !== undefined) return `${type} ${minExclusive ? ">" : "≥"} ${min}`;
    if (max !== undefined) return `${type} ${maxExclusive ? "<" : "≤"} ${max}`;
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
