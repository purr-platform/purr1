import "mocha";
import * as Ohm from "ohm-js";
import * as FS from "fs";
import * as Path from "path";
import { autorun, spec, test } from "@origamitower/specify";

const grammarSource = FS.readFileSync(
  Path.join(__dirname, "../languages/purr/grammar.ohm"),
  "utf8"
);
const grammar = Ohm.grammar(grammarSource);

function match(rule: string, source: string) {
  const match = grammar.match(source, rule);
  if (match.failed()) {
    throw new Error(
      `Failed to parse \`${source}\` starting from ${rule}.\n${match.message}`
    );
  }
}

function matchAll(rule: string, sources: string[]) {
  for (const source of sources) {
    match(rule, source);
  }
}

function matchAllMulti(rules: string[], sources: string[]) {
  for (const rule of rules) {
    matchAll(rule, sources);
  }
}

@autorun()
@spec("Purr: declarations")
export class DeclarationTest {
  @test()
  module() {
    match("Module", `module a/b/c where`);
  }

  @test()
  union() {
    match(
      "UnionDefinition",
      `union Stream
        case Pair: value With: rest
        case Delay: thunk
        case Empty
      end`
    );
  }

  @test()
  record() {
    match("RecordDefinition", `record Context { state, counter }`);
  }

  @test()
  [`function declaration`]() {
    matchAll("FunctionDefinition", [
      `define a and: b with: c as x end`,
      `define and: a with: b as x end`,
      `define not a as x end`,

      `define a <= b as x end`,
      `define a <- b as x end`,
      `define a < b as x end`,
      `define a >= b as x end`,
      `define a > b as x end`,
      `define a => b as x end`,
      `define a === b as x end`,
      `define a =/= b as x end`,
      `define a - b as x end`,
      `define a ++ b as x end`,
      `define a + b as x end`,
      `define a ** b as x end`,
      `define a * b as x end`,
      `define a / b as x end`,
      `define a | b as x end`,
      `define a & b as x end`,
      `define a and b as x end`,
      `define a or b as x end`,

      `define a b as x end`,
      `define a as x end`
    ]);
  }
}

@autorun()
@spec("Purr: Expressions")
export class PurrExpressions {
  @test()
  [`let expression`]() {
    match("Expression", `let a = b in x`);
  }

  @test()
  [`if expression`]() {
    match("Expression", `if a then b else c`);
  }

  @test()
  [`pipe expression`]() {
    match("Expression", `a |> b c |> foo: bar qux: foo`);
  }

  @test()
  [`keyword call`]() {
    matchAll("Expression", [`foo: bar qux: foo`, `a and b foo: bar qux: foo`]);
  }

  @test()
  [`or expression`]() {
    matchAllMulti(["OrExpression", "Expression"], [`a b or c`]);
  }

  @test()
  [`and expression`]() {
    matchAllMulti(["AndExpression", "Expression"], [`a b and c`]);
  }

  @test()
  [`not expression`]() {
    matchAllMulti(["NotExpression", "Expression"], [`not a b`]);
  }

  @test()
  [`equality expression`]() {
    matchAllMulti(
      ["EqualityExpression", "Expression"],
      [`a b === c d`, `a b =/= c d`]
    );
  }

  @test()
  [`relational expression`]() {
    matchAllMulti(
      ["RelationalExpression", "Expression"],
      [`a b <= c d`, `a b < c d`, `a b >= c d`, `a b > c d`]
    );
  }

  @test()
  [`add expression`]() {
    matchAllMulti(["AddExpression", "Expression"], [`a b + c d`, `a b - c d`]);
  }

  @test()
  [`multiply expression`]() {
    matchAllMulti(
      ["MultiplyExpression", "Expression"],
      ["a b * c d", "a b / c d"]
    );
  }

  @test()
  [`power expression`]() {
    matchAllMulti(["PowerExpression", "Expression"], ["a b ** c d"]);
  }

  @test()
  [`unary expression`]() {
    matchAllMulti(["UnaryExpression", "Expression"], [`a() b`]);
  }

  @test()
  [`postfix expression`]() {
    matchAllMulti(["PostfixExpression", "Expression"], ["foo(bar, baz)"]);
  }

  @test()
  [`primary expression`]() {
    matchAllMulti(["PrimaryExpression", "Expression"], ["foo", "(a foo: bar)"]);
  }
}

@autorun()
@spec("Purr: Pattern matching")
export class PurrPatternMatching {
  @test()
  [`pattern matching expression`]() {
    matchAllMulti(
      ["MatchExpression", "Expression"],
      [
        `match x
        case a when b then c
        case a then b
        otherwise a
      end`
      ]
    );
  }

  @test()
  [`patterns`]() {
    matchAll("Pattern", [
      `A.B: bar C: X.Z D: [A.B: C]`,
      `A.B`,
      `A { B, D = E }`,
      `[A, 1, A.B: C]`,
      `A`,
      `1`,
      `"foo"`,
      `true`,
      `anything`,
      `A.B: (A.B: C)`,
      `(1)`
    ]);
  }
}
