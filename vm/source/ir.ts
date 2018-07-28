import { Value, RecordType, VariantType } from "./runtime/values";

export type Expression =
  | If
  | Let
  | Apply
  | Invoke
  | Constant
  | MakeLambda
  | MakeTuple
  | MakeRecord
  | MakeVariant
  | LoadLocal
  | Project
  | Match;

export enum ExpressionTag {
  IF, // if e1 then e2 else e3
  LET, // let n = e1 in e2
  APPLY, // f(e...)
  INVOKE, // f(e...) where f is a module function
  CONSTANT, // const
  MAKE_LAMBDA, // \x. e
  MAKE_TUPLE, // e1*e2
  MAKE_RECORD, // A { ... }
  MAKE_VARIANT, // A.B(...)
  LOAD_LOCAL, // x
  PROJECT, // p(e, n)
  MATCH // match e1 with p...
}

export class If {
  readonly tag = ExpressionTag.IF;
  constructor(
    readonly test: Expression,
    readonly consequent: Expression,
    readonly alternate: Expression
  ) {}
}

export class Let {
  readonly tag = ExpressionTag.LET;
  constructor(
    readonly name: string,
    readonly value: Expression,
    readonly expression: Expression
  ) {}
}

export class Apply {
  readonly tag = ExpressionTag.APPLY;
  constructor(readonly callee: Expression, readonly args: Expression[]) {}
}

export class Invoke {
  readonly tag = ExpressionTag.INVOKE;
  constructor(readonly name: string, readonly args: Expression[]) {}
}

export class Constant {
  readonly tag = ExpressionTag.CONSTANT;
  constructor(readonly value: Value) {}
}

export class MakeLambda {
  readonly tag = ExpressionTag.MAKE_LAMBDA;
  constructor(readonly parameters: string[], readonly body: Expression) {}
}

export class MakeTuple {
  readonly tag = ExpressionTag.MAKE_TUPLE;
  constructor(readonly values: Expression[]) {}
}

export class MakeRecord {
  readonly tag = ExpressionTag.MAKE_RECORD;
  constructor(
    readonly name: string,
    readonly fields: string[],
    readonly values: Expression[]
  ) {}
}

export class MakeVariant {
  readonly tag = ExpressionTag.MAKE_VARIANT;
  constructor(
    readonly name: string,
    readonly variant: string,
    readonly values: Expression[]
  ) {}
}

export class LoadLocal {
  readonly tag = ExpressionTag.LOAD_LOCAL;
  constructor(readonly name: string) {}
}

export class Project {
  readonly tag = ExpressionTag.PROJECT;
  constructor(readonly value: Expression, readonly field: string) {}
}

export class Match {
  readonly tag = ExpressionTag.MATCH;
  constructor(readonly value: Expression, readonly cases: MatchCase[]) {}
}

export class MatchCase {
  constructor(
    readonly pattern: Pattern,
    readonly bindings: string[],
    readonly expression: Expression
  ) {}
}

export type Pattern =
  | PatternAny
  | PatternEqual
  | PatternTuple
  | PatternRecord
  | PatternVariant;

export enum PatternTag {
  ANY,
  EQUAL,
  TUPLE,
  RECORD,
  VARIANT
}

export class PatternAny {
  readonly tag = PatternTag.ANY;
}

export class PatternEqual {
  readonly tag = PatternTag.EQUAL;
  constructor(readonly value: Value) {}
}

export class PatternTuple {
  readonly tag = PatternTag.TUPLE;
  constructor(readonly arity: number) {}
}

export class PatternRecord {
  readonly tag = PatternTag.RECORD;
  constructor(readonly type: string, readonly fields: string[]) {}
}

export class PatternVariant {
  readonly tag = PatternTag.VARIANT;
  constructor(readonly type: string, readonly variant: string) {}
}
