import { EvaluatorError } from "./EvaluatorError";
import { ErrorType } from "./ErrorType";
import { stringifyValue } from "../util/stringifyValue";

/**
 * Evaluator parameter type error - a module function received an argument of the wrong type.
 * Unlike {@link EvaluatorTypeError}, this carries the offending function/parameter name as
 * structured fields, so every module gets the same message format for free instead of each
 * module author hand-writing (and potentially diverging on) the wording.
 */
export class EvaluatorParameterTypeError extends EvaluatorError {
    override name = "EvaluatorParameterTypeError";
    override readonly errorType: ErrorType | string = ErrorType.EVALUATOR_TYPE;

    /** The name of the function that received the invalid parameter. */
    readonly funcName: string;

    /** The name of the parameter that received the invalid value, if available. */
    readonly paramName?: string;

    /** String representation of the expected type. Examples include "number", "string", "binary tree". */
    readonly expected: string;

    /** The actual value that was received. */
    readonly actual: unknown;

    constructor(funcName: string, paramName: string | undefined, expected: string, actual: unknown, line?: number, column?: number, fileName?: string) {
        super(`${funcName}: Expected ${expected}${paramName ? ` for ${paramName}` : ""}, got ${stringifyValue(actual)}.`, line, column, fileName);
        this.funcName = funcName;
        this.paramName = paramName;
        this.expected = expected;
        this.actual = actual;
    }
}
