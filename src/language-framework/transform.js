//---------------------------------------------------------------------
//
// This source file is part of the Canel.és project.
//
// See LICENCE for licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//---------------------------------------------------------------------

// --[ Dependencies ]--------------------------------------------------
const t = require('babel-types');
const Refinable = require('refinable');


// --[ Aliases ]-------------------------------------------------------
const call        = t.callExpression;
const member      = t.memberExpression;
const id          = t.identifier;
const string      = t.stringLiteral;
const bool        = t.booleanLiteral;
const number      = t.numericLiteral;
const array       = t.arrayExpression;
const assignment  = t.assignmentExpression;
const spread      = t.spreadElement;
const rest        = t.restElement;
const arrowFn     = t.arrowFunctionExpression;
const fn          = t.functionExpression;
const block       = t.blockStatement;
const object      = t.objectExpression;
const property    = t.objectProperty;
const method      = t.objectMethod;
const declaration = t.variableDeclaration;
const variable    = t.variableDeclarator;
const _new        = t.newExpression;
const _try        = t.tryStatement;
const _catch      = t.catchClause;
const _throw      = t.throwStatement;
const _this       = t.thisStatement;
const _return     = t.returnStatement;
const _if         = t.ifStatement;
const program     = t.program;
const binary      = t.binaryExpression;
const unary       = t.unaryExpression;

const COMPUTED = true;


// --[ Helpers ]-------------------------------------------------------
function internal(fn, args) {
  return call(
    imember(fn),
    args
  );
}

function imember(n) {
  return member(id('$caneles'), id(n), false);
}

function callMethod(object, property, args, computed = false) {
  return call(
    member(
      object,
      property,
      computed
    ),
    args
  );
}

function asExpression(statement) {
  return call(
    arrow(
      [],
      block(statement)
    ),
    []
  );
}

function arrow(parameters, body) {
  return fn(
    null,
    parameters,
    body
  );
}

function def(kind, name, value) {
  return declaration(kind, [variable(name, value)]);
}

function toStatement(node) {
  return t.isStatement(node) ?  node
  :      /* otherwise */        t.expressionStatement(node);
}

function idFromPairs(name, pairs) {
  return `${name}\$${selectorFromPairs(pairs).replace(/:/g, '_')}`;
}

function selectorFromPairs(pairs) {
  return pairs.map(([key, _]) => `${key}:`).join('');
}

function argumentsFromPairs(pairs) {
  return pairs.map(([_, value]) => value);
}

function flatten(xss) {
  return xss.reduce((l, r) => l.concat(r), []);
}

function operationName(name) {
  switch (name) {
    case "===":   return imember('equal');
    case "=/=":   return imember('notEqual');
    case "||":    return imember('or');
    case "&&":    return imember('and');
    case ">":     return imember('greaterThan');
    case ">=":    return imember('greaterOrEqualTo');
    case "<":     return imember('lessThan');
    case "<=":    return imember('lessOrEqualTo');
    case "+":     return imember('plus');
    case "-":     return imember('minus');
    case "*":     return imember('times');
    case "/":     return imember("dividedBy");
    case "^":     return imember("power");
    case "~":     return imember("not");
    default:
      throw new SyntaxError(`Unknown operator ${name}`);
  }
}

function checkArguments(length) {
  return _if(
    binary(
      '!==',
      member(id('arguments'), id('length')),
      number(length)
    ),
    _throw(
      _new(
        id('TypeError'),
        [
          binary(
            '+',
            string(`Wrong number of arguments. Expected ${length}, given `),
            member(id('arguments'), id('length'))
          )
        ]
      )
    )
  );
}


const BindingBox = Refinable.refine({
  identifiers: new Map(),
  new() {
    return this.refine({ identifiers: new Map() })
  },
  free(name) {
    const suffix = (this.identifiers.get(name) || 0) + 1;
    this.identifiers.set(name, suffix);
    return `${name}${suffix}`;
  }
});

// --[ Compiling switch statements ]-----------------------------------
function transformSwitch(expression, cases, binding) {
  const value = id(binding.free('$ref'));

  function expand(value, pattern, body) {
    return pattern.cata({
      PatternWildcard: () =>
        body,

      PatternConstBinding: ({ identifier }) =>
        [def('const', transform(identifier, binding), value), ...body],

      PatternLetBinding: ({ identifier }) =>
        [def('let', transform(identifier, binding), value), ...body],

      PatternEqual: ({ expression }) =>
        [_if(
          binary(
            '===',
            value,
            transform(expression, binding)
          ),
          block(body),
          null
        )],

      PatternVariant: ({ tag, parameters }) => {
        const newId = id(binding.free('$ref'));
        return [
          def('const',
            newId,
            internal('extractorUnapply', [value])
          ),
          _if(
            binary(
              '&&',
              newId,
              binary(
                '===',
                member(newId, id('length')),
                number(parameters.length)
              )
            ),
            block(parameters.reduceRight((body, node, index) => {
              const pid = id(binding.free('$ref'));
              return [
                def('const',
                  pid,
                  member(newId, number(index), COMPUTED)
                ),
                ...expand(pid, node, body)
              ];
            }, body)),
            null
          )
        ]
      }
    });
  }

  function transformCases(id, ast) {
    return ast.cata({
      SwitchDefaultCase: ({ body }) =>
        [
          ...body.map(s => toStatement(transform(s, binding))),
          _return()
        ],

      SwitchCase: ({ pattern, constraint, body }) =>
        expand(id, pattern, constraint.cata({
          SwitchNoConstraint: _ =>
            [
              ...body.map(s => toStatement(transform(s, binding))),
              _return()
            ],

          SwitchBooleanConstraint: ({ expression }) =>
            [_if(
              transform(expression, binding),
              block([
                ...body.map(s => toStatement(transform(s, binding))),
                _return()
              ]),
              null
            )]
        }))
    });
  }

  return [
    def('const', value, expression),
    ...flatten(cases.map(c => transformCases(value, c)))
  ];
}


// --[ Caneles -> JS ]-------------------------------------------------
function transform(ast, bind, language) {
  return ast.cata({
    // ---[ Values ]---------------------------------------------------
    Integer: ({ value }) =>
      internal('integer', [string(value)]),

    Decimal: ({ value }) =>
      internal('decimal', [string(value)]),

    Float: ({ value }) =>
      number(value),

    String: ({ value }) =>
      string(value),

    Boolean: ({ value }) =>
      bool(value),

    Vector: ({ items }) =>
      internal('vector', [array(items.map(x => transform(x, bind)))]),

    Set: ({ items }) =>
      internal('set', [array(items.map(x => transform(x, bind)))]),

    Map: ({ items }) =>
      internal('map', [array(items.map(([k, v]) =>
        array([
          transform(k, bind),
          transform(v, bind)
        ])
      ))]),

    Tuple: ({ items }) =>
      array(items.map(x => transform(x, bind))),


    // ---[ Expressions ]----------------------------------------------
    Identifier: ({ name }) =>
      id(name),

    Assign: ({ lvalue, expression }) =>
      assignment(
        '=', transform(lvalue, bind), transform(expression, bind)
      ),

    Infix: ({ operation, left, right }) =>
      call(
        operationName(operation),
        [transform(left, bind), transform(right, bind)]
      ),

    Prefix: ({ operation, expression }) =>
      call(
        operationName(operation),
        [transform(expression, bind)]
      ),

    // ----[ Functions ]-----------------------------------------------
    Spread: ({ expression }) =>
      spread(transform(expression, bind)),

    Rest: ({ identifier }) =>
      rest(transform(identifier, bind)),

    Call: ({ expression, parameters }) =>
      call(
        transform(expression, bind),
        parameters.map(x => transform(x, bind))
      ),

    Function: ({ parameters, body }) =>
      arrow(
        parameters.map(x => transform(x, bind)),
        block([
          checkArguments(parameters.length),
          ...body.map(s => toStatement(transform(s, bind)))
        ])
      ),

    Return: ({ expression }) =>
      _return(transform(expression, bind)),


    // ---[ Sums and pattern matching ]--------------------------------
    Union: ({ tag, variants }) => {
      const ref = id(bind.free('$union'));
      return asExpression([
        def('const', ref, object([])),
        ...(variants.map(v => transform(v, bind)(ref)).map(toStatement)),
        _return(ref)
      ]);
    },

    Variant: ({ tag, fields }) => (ref) =>
      assignment(
        '=',
        member(ref, transform(tag, bind)),
        internal('variant', [
          array(fields.map(k => string(k.name))),
          fn(
            transform(tag, bind),
            fields.map(k => transform(k, bind)),
            block([
              checkArguments(fields.length),
              _if(
                unary(
                  '!',
                  binary(
                    'instanceof',
                    id('this'),
                    member(ref, transform(tag, bind))
                  ),
                  true
                ),
                _return(_new(
                  member(ref, transform(tag, bind)),
                  fields.map(k => transform(k, bind))
                ))
              ),
              ...fields.map(k => assignment(
                '=',
                member(id('this'), transform(k, bind)),
                transform(k, bind)
              )).map(toStatement)
            ])
          )
        ])
      ),

    Switch: ({ expression, cases }) =>
      asExpression(
        transformSwitch(
          transform(expression),
          cases,
          bind
        )
      ),


    // ---[ Objects ]--------------------------------------------------
    Object: ({ properties }) =>
      internal('object', [array(properties.map(x => transform(x, bind)))]),

    Getter: ({ receiver, name, body, decorators }) =>
      internal('getter', [
        string(name.name),
        decorators.reduceRight(
          (f, decorator) =>
            call(transform(decorator, bind), [f, string(name.name)]),
          fn(
            transform(name, bind),
            [],
            block([
              def('const', transform(receiver, bind), id('this')),
              ...body.map(x => transform(x, bind))
            ])
          ))
      ]),

    Setter: ({ receiver, name, parameter, body, decorators }) =>
      internal('setter', [
        string(name.name),
        decorators.reduceRight(
          (f, decorator) =>
            call(transform(decorator, bind), [f, string(name.name)]),
          fn(
            transform(name, bind),
            [transform(parameter, bind)],
            block([
              def('const', transform(receiver, bind), id('this')),
              ...body.map(x => transform(x, bind))
            ])
          ))
      ]),

    Method: ({ receiver, name, parameters, body, decorators }) =>
      internal('method', [
        string(name.name),
        decorators.reduceRight(
          (f, decorator) =>
            call(transform(decorator, bind), [f, string(name.name)]),
          fn(
            transform(name, bind),
            parameters.map(x => transform(x, bind)),
            block([
              checkArguments(parameters.length),
              def('const', transform(receiver, bind), id('this')),
              ...body.map(x => transform(x, bind))
            ])
          )
        )
      ]),

    KeywordMethod: ({ receiver, name, pairs, body, decorators }) =>
      internal('method', [
        string(idFromPairs(name.name, pairs)),
        decorators.reduceRight(
          (f, decorator) =>
            call(transform(decorator, bind), [f, string(idFromPairs(name.name, pairs))]),
          fn(
            id(idFromPairs(name.name, pairs)),
            argumentsFromPairs(pairs).map(x => transform(x, bind)),
            block([
              def('const', transform(receiver, bind), id('this')),
              ...body.map(x => transform(x, bind))
            ])
          )
        )
      ]),

    MethodCall: ({ object, property, parameters }) =>
      callMethod(
        transform(object, bind),
        transform(property, bind),
        parameters.map(x => transform(x, bind))
      ),

    KeywordMethodCall: ({ object, property, pairs }) =>
      callMethod(
        transform(object, bind),
        id(idFromPairs(property.name, pairs)),
        argumentsFromPairs(pairs).map(x => transform(x, bind))
      ),

    Member: ({ object, property }) =>
      internal('getField', [
        transform(object, bind),
        transform(property, bind)
      ]),

    AssignMember: ({ object, property, value }) =>
      internal('assignField', [
        transform(object, bind),
        transform(property, bind),
        transform(value, bind)
      ]),

    Subscript: ({ object, index }) =>
      internal('at', [
        transform(object, bind),
        transform(index, bind)
      ]),


    // ---[ Branching ]------------------------------------------------
    IfThenElse: ({ test, consequent, alternate }) =>
      _if(
        transform(test, bind),
        block(consequent.map(s => toStatement(transform(s, bind)))),
        alternate.length > 0 ?
          block(alternate.map(s => toStatement(transform(s, bind))))
        : null
      ),


    // ---[ Error handling ]-------------------------------------------
    Try: ({ expression }) =>
      asExpression([
        _try(
          block([
            _return(internal('ok', [transform(expression, bind)]))
          ]),
          _catch(
            id('error'),
            block([
              _return(internal('error', [id('error')]))
            ])
          )
        )
      ]),

    Throw: ({ expression }) =>
      asExpression([_throw(transform(expression, bind))]),


    // ---[ Declarations ]---------------------------------------------
    Const: ({ identifier, expression }) =>
      declaration('const', [
        variable(
          transform(identifier, bind),
          transform(expression, bind)
        )
      ]),

    Let: ({ identifier, expression }) =>
      declaration('let', [
        variable(
          transform(identifier, bind),
          transform(expression, bind)
        )
      ]),

    // ---[ Top level ]------------------------------------------------
    Program: ({ statements }) =>
      program([
        toStatement(assignment(
          '=',
          member(id('module'), id('exports')),
          arrow(
            [id('$runtime')],
            block([
              def('const',
                id('$caneles'),
                callMethod(id('$runtime'), id('selectRuntime'), [string(language)])
              ),
              def('const', id('$exports'), internal('module', [])),
              toStatement(asExpression(
                flatten(statements.map(s => transform(s, bind))).map(toStatement)
              )),
              _return(id('$exports'))
            ])
          )
        )),

        toStatement(
          assignment(
            '=',
            member(
              member(id('module'), id('exports')),
              id('$canelesModule')
            ),
            bool(true)
          )
        )
      ]),

    Export: ({ name, value }) =>
      assignment('=',
        member(id('$exports'), transform(name, bind)),
        transform(value, bind)
      ),

    Import: ({ module, parameters, names, binding: maybeBinding }) => {
      const binding = maybeBinding ?  transform(maybeBinding, bind)
                    : /* else */      id(bind.free('$ref'));
      return [
        def('const',
          binding,
          internal('import', [
            id('require'),
            transform(module, bind),
            parameters ?  array(parameters.map(x => transform(x, bind)))
            : /* else */  t.nullLiteral()
          ])
        ),
        ...names.map(name => {
          if (Array.isArray(name)) {
            const [original, renamed] = name;
            return def('const',
              transform(renamed, bind),
              member(binding, transform(original, bind))
            );
          } else {
            return def('const',
              transform(name, bind),
              member(binding, transform(name, bind))
            );
          }
        })
      ];
    },

    Module: ({ parameters, body }) =>
      _return(
        arrow(
          parameters.map(x => transform(x, bind)),
          block([
            checkArguments(parameters.length),
            ...flatten(body.map(x => transform(x, bind))).map(toStatement)
          ])
        )
      )
  });
}


// --[ Exports ]-------------------------------------------------------
module.exports = function(ast, language) {
  return transform(ast, BindingBox.new(), language);
};
