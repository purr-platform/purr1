import * as IR from "../../ir";
import * as R from "../../runtime";
import * as AST from "./ast";
import { Module, Variant, TypeTag } from "../../runtime";
import { unmatched } from "../../utils";

function qualid(x: AST.QualifiedId) {
  return x.names.join(".");
}

export function compile(ast: AST.Module): Module {
  const data = ast.declarations.filter(x =>
    ["record", "union"].includes(x.type)
  ) as (AST.UnionDeclaration | AST.RecordDeclaration)[];
  const functions = ast.declarations.filter(
    x => x.type === "function"
  ) as AST.FunctionDeclaration[];
  const imports = ast.declarations.filter(
    x => x.type === "import"
  ) as AST.ImportDeclaration[];

  return new Module(
    qualid(ast.id),
    new Map(imports.map(x => [x.alias, qualid(x.id)] as [string, string])),
    new Map(data.map(compileData)),
    new Map(functions.map(compileFunction))
  );
}

function compileData(
  node: AST.UnionDeclaration | AST.RecordDeclaration
): [string, R.RecordType | R.UnionType] {
  switch (node.type) {
    case "record":
      return [node.name, new R.RecordType(node.name, node.fields)];

    case "union":
      return [
        node.name,
        new R.UnionType(
          node.name,
          node.variants.map(v => {
            return new R.VariantType(v.name, v.fields);
          })
        )
      ];

    default:
      throw unmatched(node);
  }
}

function compileFunction(
  node: AST.FunctionDeclaration
): [string, R.ModuleFunction] {
  return [
    node.signature.name,
    new R.ModuleFunction(
      node.signature.name,
      node.signature.parameters,
      compileExpression(node.body, node.signature.parameters)
    )
  ];
}

function compileExpression(
  node: AST.Expression,
  locals: string[]
): IR.Expression {
  switch (node.type) {
    case "boolean":
      return new IR.Constant(new R.Bool(node.value));

    // FIXME: this should create Literal AST nodes in the runtime
    case "integer":
      return new IR.Constant(new R.Float64(+node.value));

    case "decimal":
      return new IR.Constant(new R.Float64(+node.value));

    case "text":
      return new IR.Constant(new R.Text(node.value));

    case "tuple":
      return new IR.MakeTuple(
        node.items.map(x => compileExpression(x, locals))
      );

    case "lambda":
      return new IR.MakeLambda(
        node.parameters,
        compileExpression(node.body, [...locals, ...node.parameters])
      );

    case "let-expression":
      return new IR.Let(
        node.name,
        compileExpression(node.value, locals),
        compileExpression(node.expression, [...locals, node.name])
      );

    case "if-expression":
      return new IR.If(
        compileExpression(node.test, locals),
        compileExpression(node.consequent, locals),
        compileExpression(node.alternate, locals)
      );

    case "pipe-expression":
      return new IR.Apply(compileExpression(node.right, locals), [
        compileExpression(node.left, locals)
      ]);

    case "invoke-expression":
      return new IR.Invoke(
        node.module,
        node.name,
        node.arguments.map(x => compileExpression(x, locals))
      );

    case "call-expression":
      return new IR.Apply(
        compileExpression(node.callee, locals),
        node.arguments.map(x => compileExpression(x, locals))
      );

    case "load-expression":
      if (locals.includes(node.name)) {
        return new IR.LoadLocal(node.name);
      } else {
        return new IR.Invoke("self", node.name, []);
      }

    case "external-load-expression":
      return new IR.Invoke(node.module, node.name, []);

    case "group-expression":
      return compileExpression(node.expression, locals);

    case "match-expression":
      return compilePatternMatching(node, locals);

    case "make-record-expression":
      return new IR.MakeRecord(
        node.module,
        node.name,
        node.pairs.map(x => x.field),
        node.pairs.map(x => compileExpression(x.value, locals))
      );

    case "make-variant-expression":
      return new IR.MakeVariant(
        node.module,
        node.name,
        node.variant,
        node.arguments.map(x => compileExpression(x, locals))
      );

    default:
      throw unmatched(node);
  }
}

// FIXME: compile this to a good decision tree
function compilePatternMatching(
  node: AST.Match,
  locals: string[]
): IR.Expression {
  return new IR.Match(
    compileExpression(node.value, locals),
    node.cases.map(x => compileCase(x, locals))
  );
}

function compileCase(node: AST.MatchCase, locals: string[]) {
  switch (node.tag) {
    case "default":
      return new IR.MatchCase(
        new IR.PatternAny(),
        new IR.Constant(new R.Bool(true)),
        compileExpression(node.body, locals)
      );

    case "unguarded":
      return new IR.MatchCase(
        compilePattern(node.pattern),
        new IR.Constant(new R.Bool(true)),
        compileExpression(node.body, [
          ...locals,
          ...matchBindings(node.pattern)
        ])
      );

    case "guarded": {
      const bindings = [...locals, ...matchBindings(node.pattern)];

      return new IR.MatchCase(
        compilePattern(node.pattern),
        compileExpression(node.guard, bindings),
        compileExpression(node.body, bindings)
      );
    }

    default:
      throw unmatched(node);
  }
}

function compilePattern(node: AST.Pattern): IR.Pattern {
  switch (node.type) {
    case "pattern-any":
      return new IR.PatternAny();

    case "pattern-bind":
      return new IR.PatternBind(node.name);

    case "pattern-literal": {
      const expr = compileExpression(node.value, []);
      if (expr.tag !== IR.ExpressionTag.CONSTANT) {
        throw new Error(`Invalid literal ${node}`);
      }

      return new IR.PatternEqual(expr.value);
    }

    case "pattern-record": {
      return new IR.PatternRecord(
        node.module,
        node.name,
        node.patterns.map(x => ({
          field: x.field,
          pattern: compilePattern(x.pattern)
        }))
      );
    }

    case "pattern-tuple":
      return new IR.PatternTuple(node.patterns.map(compilePattern));

    case "pattern-variant":
      return new IR.PatternVariant(
        node.module,
        node.name,
        node.variant,
        node.patterns.map(compilePattern)
      );

    default:
      throw unmatched(node);
  }
}

function matchBindings(pattern: AST.Pattern): string[] {
  switch (pattern.type) {
    case "pattern-any":
      return [];

    case "pattern-bind":
      return [pattern.name];

    case "pattern-literal":
      return [];

    case "pattern-record":
      return flatten(pattern.patterns.map(x => matchBindings(x.pattern)));

    case "pattern-tuple":
      return flatten(pattern.patterns.map(matchBindings));

    case "pattern-variant":
      return flatten(pattern.patterns.map(matchBindings));

    default:
      throw unmatched(pattern);
  }
}

function flatten<A>(xss: A[][]): A[] {
  return xss.reduce((a, b) => a.concat(b), []);
}
