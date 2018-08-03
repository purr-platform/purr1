export interface Module {
  type: "module";
  id: QualifiedId;
  declarations: Declaration[];
}

export interface QualifiedId {
  type: "qualified-id";
  names: string[];
}

export type Declaration =
  | RecordDeclaration
  | UnionDeclaration
  | FunctionDeclaration
  | ImportDeclaration;

export interface ImportDeclaration {
  type: "import";
  tag: "alias";
  id: QualifiedId;
  alias: string;
}

export interface RecordDeclaration {
  type: "record";
  name: string;
  fields: string[];
}

export interface UnionDeclaration {
  type: "union";
  name: string;
  variants: VariantDeclaration[];
}

export interface VariantDeclaration {
  type: "variant";
  tag: "keyword" | "nullary";
  name: string;
  fields: string[];
}

export interface FunctionDeclaration {
  type: "function";
  signature: FunctionSignature;
  body: any;
}

export interface FunctionSignature {
  type: "signature";
  tag:
    | "keyword"
    | "leading-keyword"
    | "negation"
    | "binary"
    | "unary"
    | "nullary";
  name: string;
  parameters: string[];
}

export type Expression =
  | Let
  | If
  | Pipe
  | Invoke
  | Call
  | Load
  | ExternalLoad
  | Group
  | Boolean
  | Number
  | Text
  | Tuple
  | Lambda
  | Match
  | MakeVariant
  | MakeRecord;

export interface Qualified {
  type: "qualified";
  module: string;
  name: string;
}

export interface Let {
  type: "let-expression";
  name: string;
  value: Expression;
  expression: Expression;
}

export interface If {
  type: "if-expression";
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}

export interface Pipe {
  type: "pipe-expression";
  left: Expression;
  right: Expression;
}

export interface Invoke {
  type: "invoke-expression";
  tag: "leading-keyword" | "keyword" | "binary" | "not" | "unary" | "nullary";
  module: string;
  name: string;
  arguments: Expression[];
}

export interface Call {
  type: "call-expression";
  callee: Expression;
  arguments: Expression[];
}

export interface Load {
  type: "load-expression";
  name: string;
}

export interface ExternalLoad {
  type: "external-load-expression";
  module: string;
  name: string;
}

export interface Group {
  type: "group-expression";
  expression: Expression;
}

export interface Boolean {
  type: "boolean";
  value: boolean;
}

export type Number = Integer | Decimal;

export interface Integer {
  type: "integer";
  value: string;
}

export interface Decimal {
  type: "decimal";
  value: string;
}

export interface Text {
  type: "text";
  value: string;
}

export interface Tuple {
  type: "tuple";
  items: Expression[];
}

export interface Lambda {
  type: "lambda";
  parameters: string[];
  body: Expression;
}

export interface MakeVariant {
  type: "make-variant-expression";
  tag: "keyword" | "nullary";
  module: string;
  name: string;
  variant: string;
  arguments: Expression[];
}

export interface MakeRecord {
  type: "make-record-expression";
  module: string;
  name: string;
  pairs: { field: string; value: Expression }[];
}

export interface Match {
  type: "match-expression";
  value: Expression;
  cases: MatchCase[];
}

export type MatchCase =
  | MatchCaseGuarded
  | MatchCaseUnguarded
  | MatchCaseDefault;

export interface MatchCaseGuarded {
  type: "match-case";
  tag: "guarded";
  pattern: Pattern;
  guard: Expression;
  body: Expression;
}

export interface MatchCaseUnguarded {
  type: "match-case";
  tag: "unguarded";
  pattern: Pattern;
  body: Expression;
}

export interface MatchCaseDefault {
  type: "match-case";
  tag: "default";
  body: Expression;
}

export type Pattern =
  | PatternVariant
  | PatternRecord
  | PatternTuple
  | PatternBind
  | PatternLiteral
  | PatternWildcard;

export interface PatternVariant {
  type: "pattern-variant";
  tag: "keyword" | "nullary";
  module: string;
  name: string;
  variant: string;
  patterns: Pattern[];
}

export interface PatternRecord {
  type: "pattern-record";
  module: string;
  name: string;
  patterns: { field: string; pattern: Pattern }[];
}

export interface PatternTuple {
  type: "pattern-tuple";
  patterns: Pattern[];
}

export interface PatternBind {
  type: "pattern-bind";
  name: string;
}

export interface PatternLiteral {
  type: "pattern-literal";
  value: Text | Boolean | Number;
}

export interface PatternWildcard {
  type: "pattern-any";
}
