//---------------------------------------------------------------------
//
// This source file is part of the Canel.és project.
//
// See LICENCE for licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//---------------------------------------------------------------------

// --[ Dependencies ]--------------------------------------------------
const { data } = require('folktale/core/adt');


// --[ The AST ]-------------------------------------------------------
const AST = data('caneles:ast', {
  // ---[ Values ]-----------------------------------------------------
  // 1_000
  Integer(sign, value, radix) {
    return { sign, value, radix }
  },

  // 1_000.0
  Decimal(sign, value) {
    return { sign, value }
  },

  // 1_000.0f
  Float(value) {
    return { value }
  },

  // "value"
  String(value) {
    return { value }
  },

  // true, false
  Boolean(value) {
    return { value }
  },

  // [1, 2, 3]
  Vector(items) {
    return { items }
  },

  // #[1, 2, 3]
  Set(items) {
    return { items }
  },

  // [key: value]
  Map(items) {
    return { items }
  },

  // a, b, c
  Tuple(items) {
    return { items }
  },


  // ---[ Expressions ]------------------------------------------------
  // id
  Identifier(name) {
    return { name }
  },

  // a := b
  Assign(lvalue, expression) {
    return { lvalue, expression }
  },

  // a op b
  Infix(operation, left, right) {
    return { operation, left, right }
  },

  // op a
  Prefix(operation, expression) {
    return { operation, expression }
  },

  Runtime(operation, parameters) {
    return { operation, parameters }
  },


  // ----[ Functions ]-------------------------------------------------
  // ...expr (in calls)
  Spread(expression) {
    return { expression }
  },

  // ...id (in declarations)
  Rest(identifier) {
    return { identifier }
  },

  // expression(arg1, arg2)
  Call(expression, parameters) {
    return { expression, parameters }
  },

  // (a, b, c) => body
  Function(parameters, body) {
    return { parameters, body }
  },

  // return expression
  Return(expression) {
    return { expression }
  },


  // ----[ Sums and pattern matching ]---------------------------------
  // union tag { variants }
  Union(tag, variants) {
    return { tag, variants }
  },

  // tag(fields)
  Variant(tag, fields) {
    return { tag, fields }
  },

  // switch expression { cases }
  Switch(expression, cases) {
    return { expression, cases }
  },

  // case pattern if constraint: body
  SwitchCase(pattern, constraint, body) {
    return { pattern, constraint, body }
  },

  // default: body
  SwitchDefaultCase(body) {
    return { body }
  },

  SwitchNoConstraint() {
  },

  SwitchBooleanConstraint(expression) {
    return { expression }
  },

  // _
  PatternWildcard() {
    return {}
  },

  // const identifier
  PatternConstBinding(identifier) {
    return { identifier }
  },

  // let identifier
  PatternLetBinding(identifier) {
    return { identifier }
  },

  // tag(arguments)
  PatternVariant(tag, parameters) {
    return { tag, parameters }
  },

  // expression
  PatternEqual(expression) {
    return { expression }
  },


  // ----[ Objects ]---------------------------------------------------
  Object(properties) {
    return { properties }
  },

  Getter(receiver, name, body, decorators) {
    return { receiver, name, body, decorators }
  },

  Setter(receiver, name, parameter, body, decorators) {
    return { receiver, name, parameter, body, decorators }
  },

  Method(receiver, name, parameters, body, decorators) {
    return { receiver, name, parameters, body, decorators }
  },

  KeywordMethod(receiver, name, pairs, body, decorators) {
    return { receiver, name, pairs, body, decorators }
  },

  MethodCall(object, property, parameters) {
    return { object, property, parameters }
  },

  KeywordMethodCall(object, property, pairs) {
    return { object, property, pairs }
  },

  Member(object, property) {
    return { object, property }
  },

  AssignMember(object, property, value) {
    return { object, property, value }
  },

  Subscript(object, index) {
    return { object, index }
  },


  // ----[ Error handling ]--------------------------------------------
  // try expression
  Try(expression) {
    return { expression }
  },

  // throw expression
  Throw(expression) {
    return { expression }
  },


  // ---[ Declarations ]-----------------------------------------------
  Const(identifier, expression) {
    return { identifier, expression }
  },

  Let(identifier, expression) {
    return { identifier, expression }
  },


  // ---[ Statements ]-------------------------------------------------
  IfThenElse(test, consequent, alternate) {
    return { test, consequent, alternate }
  },



  // ---[ Top Level ]--------------------------------------------------
  Program(statements) {
    return { statements }
  },

  Export(name, value) {
    return { name, value }
  },

  Import(module, parameters, names, binding) {
    return { module, parameters, names, binding }
  },

  Module(parameters, body) {
    return { parameters, body }
  }

});

module.exports = AST;
