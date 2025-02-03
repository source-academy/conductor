import { IDataHandler } from "../../types";
import { IEvaluator } from "./IEvaluator";

export type IInterfacableEvaluator = IEvaluator & IDataHandler;
