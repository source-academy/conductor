import { ConductorError } from "../errors/ConductorError";

export class InvalidModuleError extends ConductorError {
    constructor() {
        super("Not a module");
    }
}
