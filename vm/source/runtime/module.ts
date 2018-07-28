import { UnionType, RecordType, Lambda, Value, ModuleFunction } from "./values";
import { Environment } from "./environment";

export class Module {
  constructor(
    readonly data: Map<string, UnionType | RecordType>,
    readonly bindings: Map<string, ModuleFunction>
  ) {}

  get module() {
    return this;
  }

  lookupType(name: string): UnionType | RecordType | null {
    return this.data.get(name) || null;
  }

  lookupFunction(name: string): ModuleFunction | null {
    return this.bindings.get(name) || null;
  }
}
