import { World } from "./runtime/world";
import { Value } from "./runtime/values";
import { applyModuleFunction } from "./evaluator";

export class VM {
  constructor(readonly world: World) {}

  run(moduleId: string, entrypoint: string, args: Value[]) {
    const module = this.world.module(moduleId);
    const maybeFn = module.lookupFunction(entrypoint);
    if (maybeFn == null) {
      throw new Error(`No function ${entrypoint} defined in module.`);
    }
    return applyModuleFunction(module, maybeFn, args);
  }
}
