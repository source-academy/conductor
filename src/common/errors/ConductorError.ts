import { ErrorType } from "./ErrorType";

export class ConductorError extends Error {
    errorType: ErrorType = ErrorType.UNKNOWN;
    
    constructor(message: string) {
        super(message);
    }
}
