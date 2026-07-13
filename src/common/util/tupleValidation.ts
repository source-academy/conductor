import { EvaluatorParameterTypeError } from "../errors/EvaluatorParameterTypeError";

/**
 * Checks whether `value` is an array of exactly `length` elements, optionally checking each
 * element against `guard` (a `typeof` tag, e.g. `"number"`, or a predicate function).
 */
export function isTupleOfLength(value: unknown, length: number, guard?: string | ((element: unknown) => boolean)): value is unknown[] {
    if (!Array.isArray(value) || value.length !== length) return false;
    if (guard === undefined) return true;
    const check = typeof guard === "string" ? (element: unknown) => typeof element === guard : guard;
    return value.every(check);
}

/**
 * Asserts that `value` is an array of exactly `length` elements, throwing
 * {@link EvaluatorParameterTypeError} otherwise.
 * @param funcName The name of the function performing the check, used in the error message.
 * @param paramName The name of the parameter being checked, if available.
 */
export function assertTupleOfLength(value: unknown, length: number, funcName: string, paramName?: string): asserts value is unknown[] {
    if (!isTupleOfLength(value, length)) {
        throw new EvaluatorParameterTypeError(funcName, paramName, `tuple of length ${length}`, value);
    }
}
