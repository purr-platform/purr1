import { Module } from "./runtime/module";
import { Value } from "./runtime/values";
import { assertCallable } from "./runtime";
import { applyCallable, applyModuleFunction } from "./evaluator";

export class VM {
  constructor(readonly module: Module) {}

  run(entrypoint: string, args: Value[]) {
    const maybeFn = this.module.lookupFunction(entrypoint);
    if (maybeFn == null) {
      throw new Error(`No function ${entrypoint} defined in module.`);
    }
    return applyModuleFunction(this.module, maybeFn, args);
  }
}
