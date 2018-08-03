import * as FS from "fs";
import * as Path from "path";
import * as Ohm from "ohm-js";
import * as AST from "./ast";
import { Module } from "./ast";
const toAST = require("ohm-js/extras").toAST;

const grammar = Ohm.grammar(
  FS.readFileSync(Path.join(__dirname, "grammar.ohm"), "utf8")
);

function parseEscaped(value: string) {
  switch (value[0]) {
    case "b":
      return "\b";
    case "f":
      return "\f";
    case "n":
      return "\n";
    case "r":
      return "\r";
    case "t":
      return "\t";
    case "u":
      return String.fromCodePoint(parseInt(value.slice(1), 16));
    default:
      throw new Error(`Unknown escape sequence ${value}`);
  }
}

export function parse(source: string): Module {
  const match = grammar.match(source);
  if (match.failed()) {
    throw new Error(match.message);
  }

  function binaryOp() {
    return function(
      this: any,
      left: Ohm.Node,
      name: Ohm.Node,
      right: Ohm.Node
    ): AST.Invoke {
      const nameAST = name.toAST(this.args.mapping);

      return {
        type: "invoke-expression",
        tag: "binary",
        module: nameAST.module,
        name: nameAST.name,
        arguments: [
          left.toAST(this.args.mapping),
          right.toAST(this.args.mapping)
        ]
      };
    };
  }

  return toAST(match, {
    Module: {
      type: "module",
      id: 1,
      declarations: 3
    },
    QualifiedId: {
      type: "qualified-id",
      names: 0
    },
    Qualified_named: {
      type: "qualified",
      module: 0,
      name: 2
    },
    Qualified_self: {
      type: "qualified",
      module: 0,
      name: 2
    },
    MaybeQualified_unqualified: {
      type: "qualified",
      module: "self",
      name: 0
    },
    Import_aliasing: {
      type: "import",
      tag: "alias",
      id: 1,
      alias: 3
    },
    RecordDefinition: {
      type: "record",
      name: 1,
      fields: 3
    },
    UnionDefinition: {
      type: "union",
      name: 1,
      variants: 2
    },
    VariantDefinition_keyword(
      _case: never,
      pairs: Ohm.Node
    ): AST.VariantDeclaration {
      const pairsAST: any[] = pairs.toAST(this.args.mapping);

      return {
        type: "variant",
        tag: "keyword",
        name: pairsAST.map(x => x.keyword).join(""),
        fields: pairsAST.map(x => x.parameter)
      };
    },
    VariantDefinition_nullary: {
      type: "variant",
      tag: "nullary",
      name: 1,
      fields: () => []
    },
    FunctionDefinition: {
      type: "function",
      signature: 1,
      body: 3
    },
    FunctionSignature_keyword(
      firstArg: Ohm.Node,
      pairs: Ohm.Node
    ): AST.FunctionSignature {
      const firstArgAST = firstArg.toAST(this.args.mapping);
      const pairsAST = pairs.toAST(this.args.mapping);

      return {
        type: "signature",
        tag: "keyword",
        parameters: [firstArgAST].concat(pairsAST.map((x: any) => x.parameter)),
        name: "$" + pairsAST.map((x: any) => x.keyword).join("")
      };
    },
    FunctionSignature_leading_keyword(pairs: Ohm.Node): AST.FunctionSignature {
      const pairsAST = pairs.toAST(this.args.mapping);

      return {
        type: "signature",
        tag: "leading-keyword",
        parameters: pairsAST.map((x: any) => x.parameter),
        name: pairsAST.map((x: any) => x.keyword).join("")
      };
    },
    FunctionSignature_negation(
      _not: never,
      parameter: Ohm.Node
    ): AST.FunctionSignature {
      return {
        type: "signature",
        tag: "negation",
        name: "not",
        parameters: [parameter.toAST(this.args.mapping)]
      };
    },
    FunctionSignature_binary(
      left: Ohm.Node,
      op: Ohm.Node,
      right: Ohm.Node
    ): AST.FunctionSignature {
      return {
        type: "signature",
        tag: "binary",
        name: op.toAST(this.args.mapping),
        parameters: [
          left.toAST(this.args.mapping),
          right.toAST(this.args.mapping)
        ]
      };
    },
    FunctionSignature_unary(
      parameter: Ohm.Node,
      name: Ohm.Node
    ): AST.FunctionSignature {
      return {
        type: "signature",
        tag: "unary",
        name: name.toAST(this.args.mapping),
        parameters: [parameter.toAST(this.args.mapping)]
      };
    },
    FunctionSignature_nullary(name: Ohm.Node): AST.FunctionSignature {
      return {
        type: "signature",
        tag: "nullary",
        name: name.toAST(this.args.mapping),
        parameters: []
      };
    },
    KeywordPair: {
      type: "keyword-pair",
      keyword: 0,
      parameter: 1
    },
    Expression_let: {
      type: "let-expression",
      name: 1,
      value: 3,
      expression: 5
    },
    Expression_if: {
      type: "if-expression",
      test: 1,
      consequent: 3,
      alternate: 5
    },
    PipeExpression_pipe: {
      type: "pipe-expression",
      left: 0,
      right: 2
    },
    KeywordCall_leading_keyword(
      firstKeyword: Ohm.Node,
      pairs: Ohm.Node
    ): AST.Expression {
      const pairsAST = pairs.toAST(this.args.mapping);
      const firstKwAST = firstKeyword.toAST(this.args.mapping);

      return {
        type: "invoke-expression",
        tag: "leading-keyword",
        module: firstKwAST.module,
        name: [
          firstKwAST.name.keyword,
          ...pairsAST.map((x: any) => x.keyword)
        ].join(""),
        arguments: [
          firstKwAST.name.argument,
          ...pairsAST.map((x: any) => x.argument)
        ]
      };
    },
    KeywordCall_keyword(
      firstArg: Ohm.Node,
      firstKw: Ohm.Node,
      pairs: Ohm.Node
    ): AST.Expression {
      const firstArgAST = firstArg.toAST(this.args.mapping);
      const pairsAST = pairs.toAST(this.args.mapping);
      const firstKwAST = firstKw.toAST(this.args.mapping);

      return {
        type: "invoke-expression",
        tag: "keyword",
        module: firstKwAST.module,
        name:
          "$" +
          [
            firstKwAST.name.keyword,
            ...pairsAST.map((x: any) => x.keyword)
          ].join(""),
        arguments: [firstArgAST, firstKwAST.name.argument].concat(
          pairsAST.map((x: any) => x.argument)
        )
      };
    },
    KeywordExpression: {
      type: "keyword-expression",
      keyword: 0,
      argument: 1
    },
    OrExpression_or: binaryOp(),
    AndExpression_and: binaryOp(),
    NotExpression_not(not: Ohm.Node, argument: Ohm.Node): AST.Expression {
      const notAST = not.toAST(this.args.mapping);

      return {
        type: "invoke-expression",
        tag: "not",
        module: notAST.module,
        name: "not",
        arguments: [argument.toAST(this.args.mapping)]
      };
    },
    EqualityExpression_equal: binaryOp(),
    EqualityExpression_not_equal: binaryOp(),
    RelationalExpression_lte: binaryOp(),
    RelationalExpression_lt: binaryOp(),
    RelationalExpression_gte: binaryOp(),
    RelationalExpression_gt: binaryOp(),
    AddExpression_plus: binaryOp(),
    AddExpression_subtract: binaryOp(),
    MultiplyExpression_multiply: binaryOp(),
    MultiplyExpression_divide: binaryOp(),
    PowerExpression_power: binaryOp(),
    UnaryExpression_call(argument: Ohm.Node, name: Ohm.Node): AST.Expression {
      const nameAST = name.toAST(this.args.mapping);
      return {
        type: "invoke-expression",
        tag: "unary",
        module: nameAST.module,
        name: nameAST.name,
        arguments: [argument.toAST(this.args.mapping)]
      };
    },
    PostfixExpression_call: {
      type: "call-expression",
      callee: 0,
      arguments: 2
    },
    PrimaryExpression_external_load: {
      type: "external-load-expression",
      module: 0,
      name: 2
    },
    PrimaryExpression_external_load_self: {
      type: "external-load-expression",
      module: "self",
      name: 2
    },
    PrimaryExpression_load: {
      type: "load-expression",
      name: 0
    },
    PrimaryExpression_group: {
      type: "group-expression",
      expression: 1
    },
    VariantExpression_keyword(
      name: Ohm.Node,
      _: never,
      pairs: Ohm.Node
    ): AST.Expression {
      const pairsAST: any[] = pairs.toAST(this.args.mapping);
      const nameAST = name.toAST(this.args.mapping);

      return {
        type: "make-variant-expression",
        tag: "keyword",
        module: nameAST.module,
        name: nameAST.name,
        variant: pairsAST.map(x => x.keyword).join(""),
        arguments: pairsAST.map(x => x.argument)
      };
    },
    VariantExpression_nullary(
      name: Ohm.Node,
      _: never,
      variant: Ohm.Node
    ): AST.Expression {
      const nameAST = name.toAST(this.args.mapping);
      const variantAST = variant.toAST(this.args.mapping);

      return {
        type: "make-variant-expression",
        tag: "nullary",
        module: nameAST.module,
        name: nameAST.name,
        variant: variantAST,
        arguments: []
      };
    },
    RecordExpression(
      name: Ohm.Node,
      _0: never,
      pairs: Ohm.Node,
      _1: never
    ): AST.Expression {
      const nameAST = name.toAST(this.args.mapping);
      const pairsAST = pairs.toAST(this.args.mapping);

      return {
        type: "make-record-expression",
        module: nameAST.module,
        name: nameAST.name,
        pairs: pairsAST
      };
    },
    RecordAssignment: {
      type: "record-assignment",
      field: 0,
      value: 2
    },
    MatchExpression: {
      type: "match-expression",
      value: 1,
      cases: 2
    },
    MatchCase_guarded: {
      type: "match-case",
      tag: "guarded",
      pattern: 1,
      guard: 3,
      body: 5
    },
    MatchCase_unguarded: {
      type: "match-case",
      tag: "unguarded",
      pattern: 1,
      body: 3
    },
    MatchCase_default: {
      type: "match-case",
      tag: "default",
      body: 1
    },
    VariantKeywordPattern_keyword(
      name: Ohm.Node,
      _: never,
      pairs: Ohm.Node
    ): AST.Pattern {
      const pairsAST: any[] = pairs.toAST(this.args.mapping);
      const nameAST = name.toAST(this.args.mapping);

      return {
        type: "pattern-variant",
        tag: "keyword",
        module: nameAST.module,
        name: name.name,
        variant: pairsAST.map(x => x.keyword).join(""),
        patterns: pairsAST.map(x => x.pattern)
      };
    },
    KeywordPattern: {
      type: "keyword-pattern",
      keyword: 0,
      pattern: 1
    },
    FieldPattern_aliasing: {
      type: "field-pattern",
      field: 0,
      pattern: 2
    },
    FieldPattern_implicit_binding(node: Ohm.Node) {
      const name = node.toAST(this.args.mapping);

      return {
        type: "field-pattern",
        field: name,
        pattern: {
          type: "pattern-bind",
          name: name
        }
      };
    },
    PrimaryPattern_nullary_variant(
      name: Ohm.Node,
      _: never,
      variant: Ohm.Node
    ): AST.Pattern {
      const nameAST = name.toAST(this.args.mapping);
      const variantAST = variant.toAST(this.args.mapping);

      return {
        type: "pattern-variant",
        tag: "nullary",
        module: nameAST.module,
        name: nameAST.name,
        variant: variantAST,
        patterns: []
      };
    },
    PrimaryPattern_record(
      name: Ohm.Node,
      _0: never,
      pairs: Ohm.Node,
      _1: never
    ): AST.Pattern {
      const nameAST = name.toAST(this.args.mapping);
      const pairsAST = pairs.toAST(this.args.mapping);

      return {
        type: "pattern-record",
        module: nameAST.module,
        name: nameAST.name,
        patterns: pairsAST
      };
    },
    PrimaryPattern_tuple: {
      type: "pattern-tuple",
      patterns: 1
    },
    PrimaryPattern_bind: {
      type: "pattern-bind",
      name: 0
    },
    PrimaryPattern_literal: {
      type: "pattern-literal",
      value: 0
    },
    PrimaryPattern_wildcard: {
      type: "pattern-any"
    },
    PrimaryPattern_group: 1,
    Boolean_true: {
      type: "boolean",
      value: true
    },
    Boolean_false: {
      type: "boolean",
      value: false
    },
    Number_integer(value: Ohm.Node) {
      return {
        type: "integer",
        value: value.toAST(this.args.mapping).replace(/_/g, "")
      };
    },
    Number_decimal(value: Ohm.Node) {
      return {
        type: "decimal",
        value: value.toAST(this.args.mapping).replace(/_/g, "")
      };
    },
    Text: {
      type: "text",
      value: 0
    },
    Tuple: {
      type: "tuple",
      items: 1
    },
    Lambda_non_nullary: {
      type: "lambda",
      parameters: 1,
      body: 3
    },
    Lambda_nullary: {
      type: "lambda",
      parameters: () => [],
      body: 1
    },
    Text_raw(value: Ohm.Node) {
      return value.child(1).toAST(this.args.mapping);
    },
    Text_double(value: Ohm.Node) {
      return value
        .child(1)
        .children.map((node: Ohm.Node) => {
          const x = node.sourceString;
          if (x.startsWith("\\")) {
            return parseEscaped(x.slice(1));
          } else {
            return x;
          }
        })
        .join("");
    }
  });
}
