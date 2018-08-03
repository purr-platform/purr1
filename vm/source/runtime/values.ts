import { Environment } from "./environment";
import { Expression } from "../ir";

export interface Structure {
  project(name: string): Value;
}

export enum TypeTag {
  UNIT,
  FLOAT64,
  TEXT,
  BOOLEAN,
  TUPLE,
  RECORD,
  VARIANT,
  LAMBDA,
  PRIMITIVE_PROCEDURE,
  BACKTRACK
}

export class RecordType {
  constructor(readonly name: string, readonly fields: string[]) {}

  private checkFields(fields: string[]) {
    if (this.fields.length !== fields.length) {
      return false;
    }
    for (var i = 0; i < fields.length; ++i) {
      if (fields[i] !== this.fields[i]) {
        return false;
      }
    }
    return true;
  }

  makeInstance(fields: string[], values: Value[]) {
    if (!this.checkFields(fields)) {
      throw new Error(
        `Incorrect fields for ${this.name}. Expected ${
          this.fields
        }, got ${fields}`
      );
    }

    const mapping: any = {};
    for (var i = 0; i < fields.length; ++i) {
      mapping[fields[i]] = values[i];
    }

    return new Record(this, mapping);
  }

  extract(fields: string[], value: Value): Value[] | null {
    if (value.tag === TypeTag.RECORD && value.type === this) {
      return fields.map(f => value.value[f]);
    } else {
      return null;
    }
  }
}

export class UnionType {
  constructor(readonly name: string, readonly variants: VariantType[]) {}

  variantWithName(name: string) {
    for (const variant of this.variants) {
      if (variant.name === name) {
        return variant;
      }
    }
    throw new TypeError(`Union ${this.name} does not have a variant ${name}`);
  }

  makeInstance(variant: VariantType, values: Value[]) {
    if (variant.fields.length !== values.length) {
      throw new TypeError(
        `Union ${this.name}'s variant ${variant.name} takes ${
          variant.fields.length
        } arguments (${variant.fields}), but got ${values.length}.`
      );
    }

    const mapping: any = {};
    for (let i = 0; i < variant.fields.length; ++i) {
      mapping[variant.fields[i]] = values[i];
    }

    return new Variant(this, variant, mapping);
  }

  extract(variant: VariantType, value: Value): Value[] | null {
    if (value.tag === TypeTag.VARIANT && value.variant === variant) {
      return variant.fields.map(f => value.value[f]);
    } else {
      return null;
    }
  }
}

export class VariantType {
  constructor(readonly name: string, readonly fields: string[]) {}
}

export type Value =
  | Unit
  | Float64
  | Text
  | Bool
  | Tuple
  | Record
  | Variant
  | Lambda
  | PrimitiveProcedure
  | Backtrack;

export class Unit {
  readonly tag = TypeTag.UNIT;
}

export class Float64 {
  readonly tag = TypeTag.FLOAT64;
  constructor(readonly value: number) {}
}

export class Text {
  readonly tag = TypeTag.TEXT;
  constructor(readonly value: string) {}
}

export class Bool {
  readonly tag = TypeTag.BOOLEAN;
  constructor(readonly value: boolean) {}
}

export class Tuple {
  readonly tag = TypeTag.TUPLE;
  constructor(readonly arity: number, readonly value: Value[]) {}
}

export class Record implements Structure {
  readonly tag = TypeTag.RECORD;
  constructor(
    readonly type: RecordType,
    readonly value: { [key: string]: Value }
  ) {}

  project(name: string): Value {
    const value = this.value[name];
    if (value == null) {
      throw new TypeError(`${this.type.name} does not have a field ${name}`);
    } else {
      return value;
    }
  }
}

export class Variant implements Structure {
  readonly tag = TypeTag.VARIANT;
  constructor(
    readonly type: UnionType,
    readonly variant: VariantType,
    readonly value: { [key: string]: Value }
  ) {}

  project(name: string): Value {
    const value = this.value[name];
    if (value == null) {
      throw new TypeError(
        `${this.type.name}.${this.variant.name} does not have a field ${name}`
      );
    } else {
      return value;
    }
  }
}

export class ModuleFunction {
  constructor(
    readonly name: string,
    readonly parameters: string[],
    readonly body: Expression
  ) {}
}

export class Lambda {
  readonly tag = TypeTag.LAMBDA;
  constructor(
    readonly parameters: string[],
    readonly environment: Environment,
    readonly body: Expression
  ) {}
}

export class PrimitiveProcedure {
  readonly tag = TypeTag.PRIMITIVE_PROCEDURE;
  constructor(
    readonly name: string,
    readonly parameters: string[],
    readonly procedure: Function
  ) {}
}

export type Callable = Lambda | PrimitiveProcedure;

export class Backtrack {
  readonly tag = TypeTag.BACKTRACK;
}
