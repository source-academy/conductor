import assert from "node:assert/strict";
import test from "node:test";

import { BaseModulePlugin } from "../dist/conductor/module/index.js";
import { DataType } from "../dist/conductor/types/index.js";

const signature = {
    args: [DataType.NUMBER],
    returnType: DataType.NUMBER
};

class TestModulePlugin extends BaseModulePlugin {
    id = "test-module";
    exportedNames = ["identity"];

    identity(value) {
        return value;
    }
}

TestModulePlugin.prototype.identity.signature = signature;

function createDeferred() {
    let resolve;
    const promise = new Promise(resolvePromise => {
        resolve = resolvePromise;
    });
    return {promise, resolve};
}

test("BaseModulePlugin.initialise shares one in-flight initialisation", async () => {
    const closureMakeCalls = [];
    const closure = createDeferred();
    const evaluator = {
        async closure_make(receivedSignature, func) {
            closureMakeCalls.push({receivedSignature, func});
            return closure.promise;
        }
    };
    const plugin = new TestModulePlugin({}, [], evaluator);

    const first = plugin.initialise();
    const second = plugin.initialise();
    let secondSettled = false;
    void second.then(() => {
        secondSettled = true;
    });
    await new Promise(resolve => setImmediate(resolve));

    assert.equal(closureMakeCalls.length, 1);
    assert.equal(plugin.exports.length, 0);
    assert.equal(secondSettled, false);

    closure.resolve({
        type: DataType.CLOSURE,
        value: {
            func: closureMakeCalls[0].func,
            signature
        }
    });
    await Promise.all([first, second]);
    await plugin.initialise();

    assert.equal(closureMakeCalls.length, 1);
    assert.equal(plugin.exports.length, 1);
    assert.equal(plugin.exports[0].symbol, "identity");
    assert.equal(plugin.exports[0].signature, signature);
});

test("BaseModulePlugin.initialise preserves a failed result without retrying partial work", async () => {
    const expectedError = new Error("closure registration failed");
    let closureMakeCalls = 0;
    const evaluator = {
        async closure_make() {
            closureMakeCalls += 1;
            throw expectedError;
        }
    };
    const plugin = new TestModulePlugin({}, [], evaluator);

    await assert.rejects(plugin.initialise(), expectedError);
    await assert.rejects(plugin.initialise(), expectedError);

    assert.equal(closureMakeCalls, 1);
    assert.equal(plugin.exports.length, 0);
});
