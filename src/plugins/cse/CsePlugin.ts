import { IConduit, IChannel } from "../../conduit";
import { checkIsPluginClass } from "../../conduit/util";
import { CsePluginString } from "./strings";
import { ICseMessage, ICsePlugin } from "./types";

@checkIsPluginClass
export class CsePlugin implements ICsePlugin {
    name = CsePluginString.CSE_PLUGIN_NAME;

    private __cseChannel!: IChannel<ICseMessage>;

    static readonly channelAttach = [CsePluginString.CSE_CHANNEL];
    constructor(_conduit: IConduit, [cseChannel]: IChannel<any>[]) {
        this.__cseChannel = cseChannel;
    }
}
