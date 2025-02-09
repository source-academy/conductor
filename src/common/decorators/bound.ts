import { ConductorInternalError } from "../errors/ConductorInternalError";

export function bound(_originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = context.name;
    if (context.private) {
        throw new ConductorInternalError(`${methodName as string} is a private property`);
    }
    context.addInitializer(function () {
        this[methodName] = this[methodName].bind(this);
    });
}
