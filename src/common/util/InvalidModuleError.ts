import { ConductorError } from "../errors";

export class InvalidModuleError extends ConductorError {
    readonly errorType = "__invalidmodule";

    constructor() {
        super("Not a module");
    }
}
