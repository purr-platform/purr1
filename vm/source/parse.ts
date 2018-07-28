require("ometajs");
const { Core } = require("./grammar.ometajs");
import * as IR from "./ir";
import {
  Module,
  UnionType,
  Variant,
  VariantType,
  RecordType,
  Lambda,
  ModuleFunction,
  Float64,
  Text,
  Bool
} from "./runtime";

export function parse(source: string) {
  return normaliseModule(Core.matchAll(source, "program"));
}

function normaliseModule([id, declarations]: any[]) {
  return new Module(
    new Map(findData(declarations)),
    new Map(findBindings(declarations))
  );
}

function findData(declarations: any[]): [string, RecordType | UnionType][] {
  return declarations
    .filter(([tag]) => ["union", "record"].includes(tag))
    .map(([tag, ...args]) => {
      switch (tag) {
        case "union": {
          const [name, cases] = args;
          return [
            id(name),
            new UnionType(
              id(name),
              cases.map(([variant, fields]: any[]) => {
                return new VariantType(id(variant), fields.map(id));
              })
            )
          ] as [string, UnionType];
        }

        case "record": {
          const [name, fields] = args;
          return [id(name), new RecordType(id(name), fields.map(id))] as [
            string,
            RecordType
          ];
        }

        default:
          throw new Error(`Invalid node ${tag}`);
      }
    });
}

function findBindings(declarations: any[]): [string, ModuleFunction][] {
  return declarations
    .filter(([tag]) => tag === "define")
    .map(([_, name, args, body]) => {
      return [
        id(name),
        new ModuleFunction(id(name), args.map(id), normaliseExpr(body))
      ] as [string, ModuleFunction];
    });
}

function id([tag, name]: any[]) {
  if (tag !== "id") {
    throw new Error(`Unknown id tag ${tag}`);
  }

  return name;
}

function normaliseExpr([tag, ...args]: any[]): IR.Expression {
  switch (tag) {
    case "if":
      return new IR.If(
        normaliseExpr(args[0]),
        normaliseExpr(args[1]),
        normaliseExpr(args[2])
      );

    case "let":
      return new IR.Let(
        id(args[0]),
        normaliseExpr(args[1]),
        normaliseExpr(args[2])
      );

    case "invoke":
      return new IR.Invoke(id(args[0]), args[1].map(normaliseExpr));

    case "apply":
      return new IR.Apply(normaliseExpr(args[0]), args[1].map(normaliseExpr));

    case "tuple":
      return new IR.MakeTuple(args[0].map(normaliseExpr));

    case "lambda":
      return new IR.MakeLambda(args[0].map(id), args[1].map(normaliseExpr));

    case "make-record":
      return new IR.MakeRecord(
        id(args[0]),
        args[1].map((x: string) => id(x[0] as any)),
        args[1].map((x: any) => normaliseExpr(x))
      );

    case "make-variant":
      return new IR.MakeVariant(
        id(args[0]),
        id(args[1]),
        args[2].map(normaliseExpr)
      );

    case "project":
      return new IR.Project(normaliseExpr(args[0]), id(args[1]));

    case "match":
      return new IR.Match(
        normaliseExpr(args[0]),
        args[1].map(normaliseMatchCase)
      );

    case "num":
      return new IR.Constant(new Float64(args[0]));

    case "str":
      return new IR.Constant(new Text(args[0]));

    case "bool":
      return new IR.Constant(new Bool(args[0]));

    case "id":
      return new IR.LoadLocal(id(args[0]));

    default:
      throw new Error(`Unknown node ${tag}`);
  }
}

function normaliseMatchCase([tag, ...args]: any[]) {
  throw new Error(`not implemented`);
}
