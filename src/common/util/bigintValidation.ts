import { EvaluatorNumberRangeError } from "../errors/EvaluatorNumberRangeError";

function describeBigintRange(min?: bigint, max?: bigint): string {
    if (min !== undefined && max !== undefined) return `integer ∈ [${min}, ${max}]`;
    if (min !== undefined) return `integer ≥ ${min}`;
    if (max !== undefined) return `integer ≤ ${max}`;
    return "integer";
}

/**
 * Checks whether `value` is a bigint within the given range. The bigint counterpart to
 * {@link isNumberWithinRange} in numberValidation.ts, for module parameters/returns declared
 * {@link DataType.INTEGER} rather than {@link DataType.NUMBER} - bounds are bigint rather than
 * number so a boundary near the edge of the safe integer range doesn't itself lose precision.
 * @param min Minimum allowable value (inclusive). Omit to not perform a minimum check.
 * @param max Maximum allowable value (inclusive). Omit to not perform a maximum check.
 */
export function isBigintWithinRange(value: unknown, min?: bigint, max?: bigint): value is bigint {
    if (typeof value !== "bigint") return false;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
}

/**
 * Asserts that `value` is a bigint within the given range, throwing
 * {@link EvaluatorNumberRangeError} otherwise.
 * @param funcName The name of the function performing the check, used in the error message.
 * @param min Minimum allowable value (inclusive). Omit to not perform a minimum check.
 * @param max Maximum allowable value (inclusive). Omit to not perform a maximum check.
 * @param paramName The name of the parameter being checked, if available.
 */
export function assertBigintWithinRange(value: unknown, funcName: string, min?: bigint, max?: bigint, paramName?: string): asserts value is bigint {
    if (!isBigintWithinRange(value, min, max)) {
        throw new EvaluatorNumberRangeError(value, describeBigintRange(min, max), funcName, paramName);
    }
}
