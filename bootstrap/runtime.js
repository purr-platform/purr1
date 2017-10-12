const util = require('util');

const log = (x, ...ys) => {
  if (process.env.DEBUG_PURR) {
    console.log(`(PURR)`, x, ...ys.map(y => util.inspect(y, false, 3, false)));
  }
}

function isObject(a) {
  return a !== null && typeof a === 'object';
}

function eqVector(a, b) {
  return a.length === b.length
  &&     a.every((x, i) => eq(x, b[i]));
}

function eq(a, b) {
  return a == null || b == null               ?   (() => { throw new Error(`Unexpected null/undefined`)})
  :      a.equals && b.equals                 ?   a.equals(b)
  :      Array.isArray(a) && Array.isArray(b) ?   eqVector(a, b)
  :      /* else */                               a === b
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
  constructor(tag, fields) {
    this.tag = tag;
    this.fields = fields;
  }

  make(pairs) {
    const map = pairsToObject(pairs);
    Object.keys(map).forEach(k => {
      if (!this.fields.includes(k)) {
        throw new Error(`Extraneous field ${k} in ${this.tag}`);
      }
    });
    const values = this.fields.map(k => {
      if (!(k in map)) {
        throw new Error(`Missing field ${k} in ${this.tag}`);
      }
      return map[k];
    });

    return {
      $variant: this,
      $values: values,
      hashCode: () => 0,
      equals: (that) => {
        return this.$variant.hasInstance(that)
        &&     this.$values.every((x, i) => eq(x, that.$values[i]));
      },
      $project: (field) => {
        if (field === 'type') {
          return new Type(this);
        }
        const x = map[field];
        if (x == null) {
          throw new Error(`Invalid field ${field} for variant ${this.tag}`);
        }
        return x;
      }
    };
  }

  hasInstance(value) {
    return value === Object(value) && value.$variant === this;
  }

  unapply(value, keys) {
    if (!this.hasInstance(value)) {
      return null;
    }

    const keySet = new Set(keys);
    const fieldSet = new Set(this.fields);
    for (const k of keys) {
      if (!fieldSet.has(k))  return null;
    }
    const values = [];
    this.fields.forEach((f, i) => {
      if (keySet.has(f)) {
        values.push(value.$values[i]);
      }
    });

    return values;
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

  hasInstance(value) {
    return value === Object(value)
    &&     value.$variant
    &&     value.$variant instanceof Variant
    &&     value.$variant === this.$variants[value.$variant.tag];
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
}

class Multimethod {
  constructor(signature) {
    this.signature = signature;
    this.branches = [];
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
      if (branchSpec > specificity) {
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
          return -1;
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
    return this.method.value().invoke(...args);
  }

  specificityFor(args) {
    return this.method.value().findBranch(args);
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

  function $case(tag, fields) {
    return new Variant(tag, fields);
  }

  function $bool(v) {
    return v === "true"  ? true
    :      v === "false" ? false
    :      /* else */      (() => { throw new Error(`Invalid boolean literal ${v}`) });
  }

  function $int32(sign, value) {
    return Number(`${sign}${value}`);
  }

  function $dec64(sign, integer, decimal) {
    return Number(`${sign}${integer}.${decimal || '0'}`);
  }

  function $text(value) {
    return value;
  }

  function $vector(values) {
    return values;
  }

  function $closure(args, closure) {
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
    log(`Invoking ${sig} with`, args);
    const result = scope.at(sig).invoke(...args);
    log(`${sig} >>> `, result);
    return result;
  }

  function $call(scope, expr, args) {
    log(`Calling closure with`, args);
    const result = expr(...args);
    log(`>>> `, result);
    return result;
  }

  function $new(scope, expr, pairs) {
    return expr.make(pairs);
  }

  function $project(scope, record, field) {
    if (!record || !record.$project) {
      throw new Error(`Not projectable ${record}`);
    }

    return record.$project(field);
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
      return (actual) => expected === actual ? {} : null;
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
        if (spread == null && value.length !== patterns.length) {
          return null;
        }
        const bindings = {};
        let index = 0;
        for (const patt of patterns) {
          const maybeBindings = patt(value[index]);
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

  function $assert(scope, test, { line, column, source }) {
    if (!test) {
      throw new Error(`Assertion failed: ${source}.

At ${scope.getModule().id}, line ${line}, column ${column}`);
    }
    return test;
  }

  function $check(decl, expr) {
    const tests = decl.$tests || [];
    decl.$tests = [...tests, expr];
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
    $int32,
    $dec64,
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
    $check
  };
};

exports.World = World;