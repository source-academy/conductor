export function bound(_originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = context.name;
    if (context.private) {
        throw new Error(`${methodName as string} is a private property`);
    }
    context.addInitializer(function () {
        this[methodName] = this[methodName].bind(this);
    });
}
