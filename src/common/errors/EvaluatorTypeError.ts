import { DataType } from "../../conductor/types";
import { ConductorError } from "./ConductorError";
import { ErrorType } from "./ErrorType";

export class EvaluatorTypeError extends ConductorError {
    name = "EvaluatorTypeError";
    readonly errorType = ErrorType.TYPE;

    readonly expected: string;
    readonly actual: string;

    constructor(message: string, expected: string, actual: string) {
        super(`${message} (expected ${expected}, got ${actual})`);
        this.expected = expected;
        this.actual = actual;
    }
}
