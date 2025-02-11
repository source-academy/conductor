import { DataType } from "./DataType";
import { ExternTypeOf } from "./ExternTypeOf";

export type ReturnValue<T extends DataType> = [ExternTypeOf<T>, T];
