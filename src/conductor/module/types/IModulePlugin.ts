import type { IPlugin } from "../../../conduit";
import type { IDataHandler } from "../../types";
import type { IModuleExport } from "./IModuleExport";

export interface IModulePlugin extends IPlugin {
    readonly exports: IModuleExport[];

    evaluator: IDataHandler;
    
    /**
     * Hooks an evaluator up to this module.
     * @param evaluator The evaluator we are interacting with.
     * @throws ConductorInternalError if the module has already been hooked up.
     */
    hook(evaluator: IDataHandler): void;

    /**
     * Unhooks the evaluator from this module.
     * @throws ConductorInternalError if the module has not been hooked up.
     */
    unhook(): void;

    /** 
     * Checks if the module has been hooked up.
     * @returns true if the module has been hooked up.
     */
    isHooked(): boolean;

    /**
     * Verifies if the module has been hooked up.
     * @throws ConductorInternalError if the module has not been hooked up.
     */
    verifyHooked(): void;
}
