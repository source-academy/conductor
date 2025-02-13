import { ConductorInternalError } from "../../common/errors/ConductorInternalError";
import { IConduit, IChannel } from "../../conduit";
import { IDataHandler } from "../types";
import { IModulePlugin, IModuleExport } from "./types";

export abstract class BaseModulePlugin implements IModulePlugin {
    abstract readonly channelAttach: string[];
    abstract init(conduit: IConduit, channels: IChannel<any>[]): void;

    abstract exports: IModuleExport[];

    evaluator!: IDataHandler;

    /** Is this module ready for use? */
    private __hooked: boolean = false;

    hook(evaluator: IDataHandler): void {
        if (this.__hooked) throw new ConductorInternalError("Module already hooked");
        this.__hooked = true;
        this.evaluator = evaluator;
    }
    unhook(): void {
        this.verifyHooked();
        this.__hooked = false;
    }
    isHooked(): boolean {
        return this.__hooked;
    }
    verifyHooked(): void {
        if (!this.__hooked) throw new ConductorInternalError("Module not hooked");
    }
}
