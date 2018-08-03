import { UnionType, RecordType, Lambda, Value, ModuleFunction } from "./values";
import { Environment } from "./environment";

export class Module {
  private _world: World | null;

  constructor(
    readonly id: string,
    readonly imports: Map<string, string>,
    readonly data: Map<string, UnionType | RecordType>,
    readonly bindings: Map<string, ModuleFunction>
  ) {
    this._world = null;
  }

  attachTo(world: World) {
    world.addModule(this);
    this._world = world;
  }

  getImport(alias: string) {
    const id = this.imports.get(alias);
    if (id == null) {
      throw new Error(`No import ${id}`);
    }
    if (this._world == null) {
      throw new Error(`${this.id} is not attached to any world`);
    }
    return this._world.module(id);
  }

  lookupType(name: string): UnionType | RecordType | null {
    return this.data.get(name) || null;
  }

  lookupFunction(name: string): ModuleFunction | null {
    return this.bindings.get(name) || null;
  }
}

export class World {
  private _modules: Map<string, Module>;

  constructor() {
    this._modules = new Map();
  }

  addModule(module: Module) {
    if (this._modules.has(module.id)) {
      throw new Error(`Duplicated module ${module.id}`);
    }
    this._modules.set(module.id, module);
  }

  module(id: string) {
    const module = this._modules.get(id);
    if (module != null) {
      return module;
    } else {
      throw new Error(`Undefined module ${id}`);
    }
  }
}
