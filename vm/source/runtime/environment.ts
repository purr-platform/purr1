import { Value } from "./values";
import { Module } from "./world";

export interface Environment {
  lookup(name: string): Value | null;
  define(name: string, value: Value): void;
  module: Module;
}

export class LexicalEnvironment {
  readonly module: Module;
  readonly parent: Environment | null;
  readonly bindings: Map<string, Value>;

  constructor(module: Module, parent: Environment | null) {
    this.module = module;
    this.parent = parent;
    this.bindings = new Map();
  }

  lookup(name: string) {
    const value = this.bindings.get(name);
    if (value != null) {
      return value;
    } else if (this.parent != null) {
      return this.parent.lookup(name);
    } else {
      return null;
    }
  }

  define(name: string, value: Value) {
    if (this.bindings.has(name)) {
      throw new Error(`${name} already exists.`);
    }

    this.bindings.set(name, value);
  }

  static extend(original: Environment, newBindings: { [key: string]: Value }) {
    const result = new LexicalEnvironment(original.module, original);
    for (const key of Object.keys(newBindings)) {
      result.define(key, newBindings[key]);
    }
    return result;
  }
}
