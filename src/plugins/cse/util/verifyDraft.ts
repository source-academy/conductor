import { isDraft } from "immer";
import { ConductorInternalError } from "../../../common/errors";

/**
 * Decorates a method with a draft assertion, ensuring it can
 * only be called on a draft.
 * @param method The method to be decorated.
 * @param context The decorator context.
 * @returns The decorated method.
 */
export function verifyDraft<Arg extends any[], Ret, ThisType>(method: (...args: Arg) => Ret, context: ClassMethodDecoratorContext<ThisType>): typeof method {
    return function draftOnlyMethod(this: ThisType, ...args: Arg) {
        if (!isDraft(this)) throw new ConductorInternalError(`${String(context.name)} can only be called on draft`);
        return method.apply(this, args);
    }
}
