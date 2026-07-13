import { EvaluatorParameterTypeError } from "./EvaluatorParameterTypeError";

export interface NumberRangeOptions {
    /** Minimum allowable value (inclusive). Omit to not perform a minimum check. */
    min?: number;
    /** Maximum allowable value (inclusive). Omit to not perform a maximum check. */
    max?: number;
    /** `true` by default. Set to `false` to allow non-integer values. */
    integer?: boolean;
}

function describeNumberRange(options: NumberRangeOptions | string): string {
    if (typeof options === "string") return options;
    const { min, max, integer = true } = options;
    const type = integer ? "integer" : "number";
    if (min !== undefined && max !== undefined) return `${type} ∈ [${min}, ${max}]`;
    if (min !== undefined) return `${type} ≥ ${min}`;
    if (max !== undefined) return `${type} ≤ ${max}`;
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
