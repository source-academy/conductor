import { PluginClass } from "../../../conduit";
import { IEvaluator } from "../../runner";
import { IModulePlugin } from "./IModulePlugin";

export type ModuleClass<T extends IModulePlugin = IModulePlugin> = PluginClass<[IEvaluator], T>;
