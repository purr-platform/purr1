import { Expression, ExpressionTag, PatternTag, Pattern } from "./ir";
import { Environment, LexicalEnvironment } from "./runtime/environment";
import { unmatched } from "./utils";
import {
  isTrue,
  assertCallable,
  assertRecordType,
  assertUnionType,
  assertStructure,
  equalsPrimitives,
  assertTuple
} from "./runtime/primitives";
import {
  Value,
  Callable,
  TypeTag,
  Lambda,
  Tuple,
  ModuleFunction
} from "./runtime/values";
import { Module } from "./runtime";

export function evaluate(node: Expression, environment: Environment): Value {
  switch (node.tag) {
    case ExpressionTag.IF: {
      const test = evaluate(node.test, environment);
      if (isTrue(test)) {
        return evaluate(node.consequent, environment);
      } else {
        return evaluate(node.alternate, environment);
      }
    }

    case ExpressionTag.LET: {
      const value = evaluate(node.value, environment);
      const newEnvironment = LexicalEnvironment.extend(environment, {
        [node.name]: value
      });
      return evaluate(node.expression, newEnvironment);
    }

    case ExpressionTag.APPLY: {
      const callee = assertCallable(evaluate(node.callee, environment));
      const args = node.args.map(x => evaluate(x, environment));
      return applyCallable(callee, args);
    }

    case ExpressionTag.INVOKE: {
      const callee = environment.module.lookupFunction(node.name);
      const args = node.args.map(x => evaluate(x, environment));
      if (callee == null) {
        throw new Error(`No function ${node.name} defined`);
      }
      return applyModuleFunction(environment.module, callee, args);
    }

    case ExpressionTag.CONSTANT: {
      return node.value;
    }

    case ExpressionTag.MAKE_LAMBDA: {
      return new Lambda(node.parameters, environment, node.body);
    }

    case ExpressionTag.MAKE_TUPLE: {
      const values = node.values.map(x => evaluate(x, environment));
      return new Tuple(values.length, values);
    }

    case ExpressionTag.MAKE_RECORD: {
      const recordType = assertRecordType(
        environment.module.lookupType(node.name)
      );
      const values = node.values.map(x => evaluate(x, environment));
      return recordType.makeInstance(node.fields, values);
    }

    case ExpressionTag.MAKE_VARIANT: {
      const unionType = assertUnionType(
        environment.module.lookupType(node.name)
      );
      const variantType = unionType.variantWithName(node.variant);
      const values = node.values.map(x => evaluate(x, environment));
      return unionType.makeInstance(variantType, values);
    }

    case ExpressionTag.LOAD_LOCAL: {
      const value = environment.lookup(node.name);
      if (value == null) {
        throw new Error(`${node.name} is not defined.`);
      } else {
        return value;
      }
    }

    case ExpressionTag.PROJECT: {
      const structure = assertStructure(evaluate(node.value, environment));
      return structure.project(node.field);
    }

    case ExpressionTag.MATCH: {
      const value = evaluate(node.value, environment);
      for (const matchCase of node.cases) {
        const match = matchPattern(matchCase.pattern, value, environment);
        if (match != null) {
          if (match.length !== matchCase.bindings.length) {
            throw new TypeError(
              `Incorrect number of bindings for patterns (${
                matchCase.bindings
              } has ${
                matchCase.bindings.length
              } bindings, but the match resulted in ${match.length} values)`
            );
          }
          const newEnvironment = LexicalEnvironment.extend(environment, {});
          for (let i = 0; i < matchCase.bindings.length; ++i) {
            newEnvironment.define(matchCase.bindings[i], match[i]);
          }
          return evaluate(matchCase.expression, newEnvironment);
        }
      }
      throw new TypeError(`${value} was not matched by any patterns.`);
    }

    default:
      throw unmatched(node);
  }
}

export function applyModuleFunction(
  module: Module,
  fn: ModuleFunction,
  args: Value[]
) {
  if (args.length !== fn.parameters.length) {
    throw new TypeError(
      `${fn.name} expects ${fn.parameters.length} arguments, but got ${
        args.length
      }`
    );
  }

  const newEnvironment = new LexicalEnvironment(module, null);
  for (let i = 0; i < fn.parameters.length; ++i) {
    newEnvironment.define(fn.parameters[i], args[i]);
  }
  return evaluate(fn.body, newEnvironment);
}

export function applyCallable(callable: Callable, args: Value[]) {
  if (args.length !== callable.parameters.length) {
    throw new TypeError(
      `Expected ${callable.parameters.length} arguments, but got ${args.length}`
    );
  }

  switch (callable.tag) {
    case TypeTag.LAMBDA: {
      const newEnvironment = LexicalEnvironment.extend(
        callable.environment,
        {}
      );
      for (let i = 0; i < callable.parameters.length; ++i) {
        newEnvironment.define(callable.parameters[i], args[i]);
      }
      return evaluate(callable.body, newEnvironment);
    }

    case TypeTag.PRIMITIVE_PROCEDURE: {
      return callable.procedure(...args);
    }

    default:
      throw unmatched(callable);
  }
}

function matchPattern(
  pattern: Pattern,
  value: Value,
  environment: Environment
) {
  switch (pattern.tag) {
    case PatternTag.ANY:
      return [value];

    case PatternTag.EQUAL:
      if (equalsPrimitives(value, pattern.value)) {
        return [value];
      } else {
        return null;
      }

    case PatternTag.TUPLE: {
      const tuple = assertTuple(value);
      if (pattern.arity === tuple.arity) {
        return tuple.value;
      } else {
        return null;
      }
    }

    case PatternTag.RECORD: {
      const recordType = assertRecordType(
        environment.module.lookupType(pattern.type)
      );
      return recordType.extract(pattern.fields, value);
    }

    case PatternTag.VARIANT: {
      const unionType = assertUnionType(
        environment.module.lookupType(pattern.type)
      );
      const variantType = unionType.variantWithName(pattern.variant);
      return unionType.extract(variantType, value);
    }

    default:
      throw unmatched(pattern);
  }
}
