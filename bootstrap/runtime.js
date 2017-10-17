const util = require('util');
const { BigInteger } = require('bigdecimal');
const im = require('immutable');


class Integer {
  constructor(value) {
    this.value = value;
  }

  equals(that) {
    return that instanceof Integer
    &&     that.value.compareTo(this.value) === 0;
  }
}

const log = (x, ...ys) => {
  if (process.env.DEBUG_PURR) {
    console.log(`(PURR)`, x, ...ys.map(y => util.inspect(y, false, 3, false)));
  }
}

const logp = (x, ...ys) => {
  if (process.env.DEBUG_PURR) {
    console.log(`(PURR)`, x, ...ys);
  }
}


function isObject(a) {
  return a !== null && typeof a === 'object';
}

function eqVector(a, b) {
  return a.length === b.length
  &&     a.every((x, i) => eq(x, b[i]));
}

function isInt(a) {
  return a instanceof Integer;
}

function eq(a, b) {
  return a == null || b == null               ?   (() => { throw new Error(`Unexpected null/undefined`)})
  :      a.equals && b.equals                 ?   a.equals(b)
  :      Array.isArray(a) && Array.isArray(b) ?   eqVector(a, b)
  :      /* else */                               a === b
}

function show(v) {
  return v == null               ?     `<Invalid value>`
  :      typeof v === 'number'   ?     Math.floor(v) === v ? v.toFixed(1) : v
  :      !isObject(v)            ?     JSON.stringify(v)
  :      Array.isArray(v)        ?     `[${v.map(show).join(', ')}]`
  :      isInt(v)                ?     `${v.value}`
  :      typeof v === 'function' ?     `<Closure with arity ${v.length}>`
  :      im.List.isList(v)       ?     `[${v.toArray().map(show).join(', ')}]`
  :      v.$show                 ?     v.$show()
  :      /* else */                    `<Unknown value>`;
}

class World {
  constructor() {
    this.modules = new Map();
  }

  defineModule(module) {
    if (this.modules.has(module.id)) {
      throw new Error(`Duplicated module ID: ${module.id}`);
    }
    this.modules.set(module.id, module);
  }

  find(id) {
    if (this.modules.has(id)) {
      return this.modules.get(id);
    } else {
      throw new Error(`Unknown module ${id}`);
    }
  }

  start() {
    for (const module of this.modules.values()) {
      if (!module.initialised) {
        log(`Initialising ${module.id}`);
        module.init();
      }
    }
  }
}


class Module {
  constructor(id, meta, builder) {
    this.id = id;
    this.scope = new Scope(null, this);
    this.exports = [];
    this.builder = builder;
    this.initialised = false;
    this.meta = meta;
  }

  _assertInit() {
    if (!this.initialised) {
      throw new Error(`Module ${this.id} hasn't been initialised`);
    }
  }

  init() {
    log(`Initialising ${this.id}`);
    this.builder(this);
    this.initialised = true;
  }

  makePublic(names) {
    this.exports.push(...names);
  }

  at(id) {
    this._assertInit();
    return this.scope.at(id);
  }

  atPublic(id) {
    this._assertInit();
    if (this.exports.includes(id)) {
      return this.at(id);
    } else {
      throw new Error(`No binding ${id} exported from ${this.id}`);
    }
  }

  put(id, value) {
    this.scope.put(id, value);
  }

  has(id) {
    return this.scope.has(id);
  }

  getScope() {
    return this.scope;
  }

  getModule() {
    return this;
  }
}

class Scope {
  constructor(parent, module) {
    this.parent = parent;
    this.module = module;
    this.bindings = Object.create(null);
  }

  at(id) {
    if (id in this.bindings) {
      const value = this.bindings[id];
      if (value instanceof Thunk) {
        return value.value;
      } else {
        return value;
      }
    } else if (this.parent) {
      return this.parent.at(id);
    } else {
      throw new Error(`Undefined ${id}`);
    }
  }

  put(id, value) {
    this.bindings[id] = value;
  }

  has(id) {
    return id in this.bindings;
  }

  getScope() {
    return this;
  }

  getModule() {
    return this.module;
  }

  all() {
    return Object.entries(this.bindings).concat(
      this.parent ? this.parent.all() : []
    )
  }
}

class Thunk {
  constructor(fn) {
    this.fn = fn;
    this._forced = false;
    this._value = null;
  }

  get value() {
    if (this._forced) {
      return this._value;
    } else {
      const fn = this.fn;
      this._value = fn();
      this._forced = true;
      return this._value;
    }
  }

  invoke() {
    return this.value;
  }

  $show() {
    return `<Thunk>`;
  }
}

class Record {
  constructor(id, fields) {
    this.id = id;
    this.fields = fields;
  }

  make(pairs) {
    const result = {};
    result.$parent = this;
    result.$data = Object.create(null);
    const obj = pairsToObject(pairs);
    Object.keys(obj).forEach(k => {
      if (!this.fields.includes(k)) {
        throw new Error(`Extraneous ${k} in ${this.id}. Accepted: ${this.fields.join(', ')}`);
      }
    })
    this.fields.forEach(k => {
      if (!(k in obj)) {
        throw new Error(`Missing ${k} in ${this.id}`);
      }
      result.$data[k] = obj[k];
    });
    result.hashCode = () => 0;
    result.equals = (that) => {
      return this.hasInstance(that)
      &&     this.fields.every(k => eq(result.$data[k], that.$data[k]));
    };
    result.$project = (field) => {
      if (field === 'type') {
        return new Type(this);
      }
      const x = result.$data[field];
      if (x == null) {
        throw new Error(`No field ${field} in ${this.id}`);
      }
      return x;
    };
    result.$show = () => {
      const pairs = [...Object.entries(this.values)].map(([k, v]) => {
        return `${k} = ${show(v)}`;
      });
      return `${this.id} { ${pairs.join(', ')} }`;
    };
    return result;
  }

  hasInstance(value) {
    return value === Object(value) && value.$parent === this;
  }

  unapply(value, keys) {
    if (!(this.hasInstance(value))) {
      return null;
    }

    return keys.map(k => value.$project(k));
  }
}

class Variant {
  constructor(tag, arity) {
    this.tag = tag;
    this.arity = arity;
  }

  make(values) {
    if (values.length !== this.arity) {
      throw new Error(`${this.tag} requires ${this.arity} arguments, got ${values.length}`);
    }

    return {
      $variant: this,
      $values: values,
      hashCode: () => 0,
      equals(that) {
        return this.$variant.hasInstance(that)
        &&     this.$values.every((x, i) => eq(x, that.$values[i]));
      },
      $show() {
        const pairs = [...Object.entries(this.$values)].map(([k, v]) => {
          return `${k} = ${show(v)}`;
        });
        return `${this.$variant.tag} { ${pairs.join(', ')} }`;
      }
    };
  }

  hasInstance(value) {
    return value === Object(value) && value.$variant === this;
  }

  unapply(value) {
    if (!this.hasInstance(value)) {
      return null;
    } else {
      return value.$values;
    }
  }
}

class Union {
  constructor(id, variants) {
    this.$id = id;
    this.$variants = Object.create({});
    variants.forEach(x => {
      this.$variants[x.tag] = x;
    });
  }

  $show() {
    return `<Union: ${this.$id} (${Object.keys(this.$variants).join(', ')})>`;
  }

  hasInstance(value) {
    return value === Object(value)
    &&     value.$variant
    &&     value.$variant instanceof Variant
    &&     value.$variant === this.$variants[value.$variant.tag];
  }

  getVariant(tag) {
    const x = this.$variants[tag];
    if (x == null) {
      throw new Error(`No variant ${tag} in union ${this.$id}`);
    }
    return x;
  }

  $project(field) {
    if (field === 'type') {
      return new Type(this);
    }
    const x = this.$variants[field];
    if (x == null) {
      throw new Error(`No variant ${field} in union ${this.$id}`);
    }
    return x;
  }
}

class Type {
  constructor(what) {
    this.what = what;
  }

  hasInstance(value) {
    return value === this.what;
  }

  $show() {
    return `<Type>`;
  }
}

class Multimethod {
  constructor(signature) {
    this.signature = signature;
    this.branches = [];
  }

  $show() {
    return `<Multi-method: ${signature}>`;
  }

  add(branch) {
    this.branches.push(branch);
  }

  invoke(...args) {
    const [method, specificity] = this.findBranch(args);

    if (!method) {
      throw new Error(`No method matched the arguments for ${this.signature}`);
    } else {
      return method.invoke(...args);
    }
  }

  findBranch(args) {
    let method = null;
    let specificity = -1;

    for (const branch of this.branches) {
      const [meth, branchSpec] = branch.specificityFor(args);
      if (meth != null && branchSpec > specificity) {
        method = meth;
        specificity = branchSpec;
      }
    }

    return [method, specificity];
  }
}


class MultimethodBranch {
  constructor(parameters, fn) {
    this.parameters = parameters;
    this.fn = fn;
  }

  invoke(...args) {
    return this.fn(...args);
  }

  specificityFor(args) {
    let result = 0;
    let index = 0;

    for (const p of this.parameters) {
      const arg = args[index];
      if (p != null) {
        if (p().hasInstance(arg)) {
          result += 1;
        } else {
          return [null, -1];
        }
      }
      index += 1;
    }

    return [this, result];
  }
}

class MultimethodImport {
  constructor(method) {
    this.method = method;
  }

  invoke(...args) {
    const val = this.method.value;
    return val.invoke(...args);
  }

  specificityFor(args) {
    const val = this.method.value;
    return val.findBranch(args);
  }
}


function pairsToObject(pairs) {
  const result = Object.create(null);
  for (const [k, v] of pairs) {
    result[k] = v;
  }
  return result;
}


exports.runtime = function(world) {
  function $module(id, meta, builder) {
    log(`Defining module ${id}`);
    world.defineModule(new Module(id, meta, builder));
  }

  function $use(scope, id, names) {
    log(`Requiring ${id} from ${scope.id} (only ${names.map(x => x[0]).join(', ')})`);
    for (const [name, alias] of names) {
      if (/\b_\b/.test(name)) {
        const method = scope.has(name) ? scope.getScope().at(name) : new Multimethod(name);
        method.add(new MultimethodImport(new Thunk(() => world.find(id).atPublic(name))));
        scope.put(alias, method);
      } else {
        scope.put(alias, new Thunk(() => world.find(id).atPublic(name)));
      }
    }
  }

  function $public(scope, names) {
    log(`Exporting ${names.join(', ')} from ${scope.id}`);
    scope.makePublic(names);
  }

  function $method(scope, name, params, fn) {
    if (scope.has(name)) {
      log(`Refining ${name} in ${scope.id}`);
    } else {
      log(`Defining a new method ${name} in ${scope.id}`);
    }
    const method = scope.has(name) ? scope.getScope().at(name) : new Multimethod(name);
    const branch = new MultimethodBranch(params, fn);
    method.add(branch);
    scope.put(name, method);
    return method;
  }

  function $thunk(scope, name, fn) {
    if (scope.has(name)) {
      throw new Error(`Duplicated ${name} in ${scope.id}`);
    }
    const thunk = new Thunk(fn);
    scope.put(name, thunk);
    return thunk;
  }

  function $scope(base, closure) {
    const newScope = new Scope(base.getScope(), base.getModule());
    return closure(newScope);
  }

  function $scope_apply_params(scope, params, values) {
    params.forEach((k, i) => scope.put(k, values[i]));
  }

  function $deref(scope, name) {
    return scope.at(name);
  }

  function $record(scope, id, fields) {
    log(`Defining a record ${id} in ${scope.id} with ${fields.join(', ')}`);
    const record = new Record(id, fields)
    scope.put(id, record);
    return record;
  }

  function $union(scope, id, cases) {
    log(`Defining an union ${id} in ${scope.id} with cases ${cases.map(x => x.tag).join(', ')}`);
    const union = new Union(id, cases);
    scope.put(id, union);
    return union;
  }

  function $case(tag, args) {
    return new Variant(tag, args);
  }

  function $bool(v) {
    return v === "true"  ? true
    :      v === "false" ? false
    :      /* else */      (() => { throw new Error(`Invalid boolean literal ${v}`) });
  }

  function $int(sign, value) {
    const x = new Integer(new BigInteger(`${value}`));
    if (sign === '-') {
      return new Integer(x.value.negate());
    } else {
      return x;
    }
  }

  function $dec(sign, integer, decimal) {
    return Number(`${sign}${integer}.${decimal || '0'}`);
  }

  function $text(value) {
    return value;
  }

  function $vector(values) {
    return im.List(values);
  }

  function $closure(args, closure) {
    closure.arity = args.length;
    return closure;
  }

  function $iftrue(value) {
    if (typeof value !== 'boolean') {
      throw new Error(`Expected boolean`);
    }
    return value;
  }

  function $let(scope, id, value, expr) {
    const newScope = new Scope(scope.getScope(), scope.getModule());
    newScope.put(id, value);
    return expr(newScope);
  }

  function $method_call(scope, sig, args) {
    logp(`Invoking ${sig} with`, show(args));
    const result = scope.at(sig).invoke(...args);
    logp(`${sig} >>> `, show(result));
    return result;
  }

  function $call(scope, expr, args) {
    const arity = expr.length || expr.arity;
    if (arity !== args.length) {
      throw new Error(`Expected ${arity} arguments, but got ${args.length}`);
    }
    logp(`Calling closure with`, show(args));
    const result = expr(...args);
    logp(`>>> `, show(result));
    return result;
  }

  function $new(scope, expr, pairs) {
    return expr.make(pairs);
  }

  function $makevar(scope, struct, tag, args) {
    return struct.getVariant(tag).make(args);
  }

  function $project(scope, record, field) {
    if (!record || !record.$project) {
      throw new Error(`Not projectable ${record}`);
    }

    return record.$project(field);
  }

  function $variant_get(struct, tag) {
    if (!(struct instanceof Union)) {
      log('Not an union: ', show(struct));
      throw new Error(`Expected Union`);
    }
    return struct.getVariant(tag);
  }

  function $match(baseScope, value, cases) {
    for (const c of cases) {
      const result = c(baseScope, value);
      if (result.matched) {
        return result.value;
      }
    }
    throw new Error(`No pattern matched: ${util.inspect(value, false, 3, true)}`);
  }

  function $match_case(pattern, expr) {
    return (baseScope, value) => {
      const bindings = pattern(value);
      if (bindings !== null) {
        const scope = new Scope(baseScope.getScope(), baseScope.getModule());
        Object.entries(bindings).forEach(([k, v]) => scope.put(k, v));
        return { matched: true, value: expr(scope) };
      } else {
        return { matched: false };
      }
    }
  }


  const $pattern = {
    $any(value) {
      return {};
    },

    $equal(expected) {
      return (actual) => eq(expected, actual) ? {} : null;
    },

    $bind(id) {
      return (value) => ({ [id]: value });
    },

    $unapply(struct, fields) {
      return (value) => {
        const items = struct.unapply(value, fields.map(x => x[0]));
        if (items == null) {
          return null;
        } else {
          const bindings = {};
          let index = 0;
          for (const [key, patt] of fields) {
            const maybeBindings = patt(items[index]);
            if (maybeBindings == null) {
              return null;
            } else {
              Object.assign(bindings, maybeBindings);
            }
            index += 1;
          }
          return bindings;
        }
      };
    },

    $vector(patterns, spread) {
      return (value) => {
        if (!im.List.isList(value)) {
          return null;
        }
        if (spread == null && value.size !== patterns.length) {
          return null;
        }
        const bindings = {};
        let index = 0;
        for (const patt of patterns) {
          const maybeBindings = patt(value.get(index));
          if (maybeBindings == null) {
            return null;
          } else {
            Object.assign(bindings, maybeBindings);
          }
          index += 1;
        }
        if (spread != null) {
          const spreadBindings = spread(value.slice(index));
          if (spreadBindings == null) {
            return null;
          } else {
            Object.assign(bindings, spreadBindings);
          }
        }
        return bindings;
      };
    }
  };

  let inCheck = false;
  function $assert(scope, test, { line, column, source }) {
    if (test !== true) {
      const additional = typeof test === 'string' ? `\n${test}\n` : '';
      throw new Error(`Assertion failed: ${source}
${additional}
At ${scope.getModule().id}, line ${line}, column ${column}`);
    } else if (inCheck) {
      console.log(`  ○ ${source}`);
    }
    return test;
  }

  function $check(scope, decl, expr) {
    const tests = decl.$tests || [];
    decl.$tests = [...tests, () => {
      inCheck = true;
      expr();
      inCheck = false;
    }];
    return decl;
  }

  function $annotate(scope, decl, id, args) {
    const ann = decl.$annotations || new Map();
    const xs = ann.get(id) || [];
    ann.set(id, [...xs, args]);
    decl.$annotations = ann;
    return decl;
  }


  return {
    $module,
    $thunk,
    $use,
    $public,
    $method,
    $scope,
    $scope_apply_params,
    $method_call,
    $deref,
    $record,
    $union,
    $case,
    $bool,
    $int,
    $dec,
    $text,
    $vector,
    $closure,
    $iftrue,
    $let,
    $method_call,
    $call,
    $new,
    $project,
    $match,
    $match_case,
    $pattern,
    $assert,
    $check,
    $annotate,
    $variant_get,
    $makevar,

    show, eq, isInt, isObject,
    Integer,
    World, Module, Scope, Thunk, Record, Variant, Union, Type, Multimethod, MultimethodBranch, MultimethodImport
  };
};

exports.World = World;