//---------------------------------------------------------------------
//
// This source file is part of the Canel.és project.
//
// See LICENCE for licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//---------------------------------------------------------------------

let runtime = Object.create(null);

function getType(value) {
  return typeof value === 'string'  ?  'string'
  :      typeof value === 'number'  ?  'float'
  :      typeof value === 'boolean' ?  'bool'
  :      /* otherwise */               value.$type;
}

function types(l, r) {
  return getType(l) + ':' + getType(r);
}

// --[ Dependencies ]--------------------------------------------------
const { BigDecimal, BigInteger } = require('bigdecimal');
const { List:IVector, Map:IMap, Set:ISet } = require('Immutable');
const { data } = require('folktale/core/adt');


// --[ Values ]--------------------------------------------------------
function Integer(value) {
  this.$value = BigInteger(value);
}
Integer.prototype = Object.create(null);
Integer.prototype.$type = 'integer';
Integer.prototype.$equals = function(r) {
  return this.$value.equals(r.$value);
}
Integer.prototype.$compare = function(r) {
  return this.$value.compareTo(r.$value);
}

Integer.prototype.$add = function(r) {
  return new Integer(this.$value.add(r.$value));
}
Integer.prototype.$minus = function(r) {
  return new Integer(this.$value.subtract(r.$value));
}
Integer.prototype.$times = function(r) {
  return new Integer(this.$value.multiply(r.$value));
}
Integer.prototype.$div = function(r) {
  return new Integer(this.$value.divide(r.$value));
}
Integer.prototype.$pow = function(r) {
  return new Integer(this.$value.pow(r.$value));
}

function Decimal(value) {
  this.$value = BigDecimal(value);
}
Decimal.prototype = Object.create(null);
Decimal.prototype.$type = 'decimal';
Decimal.prototype.$equals = function(r) {
  return this.$value.equals(r.$value);
}

Decimal.prototype.$add = function(r) {
  return new Decimal(this.$value.add(r.$value));
}
Decimal.prototype.$compare = function(r) {
  return this.$value.compareTo(r.$value);
}
Decimal.prototype.$minus = function(r) {
  return new Decimal(this.$value.subtract(r.$value));
}
Decimal.prototype.$times = function(r) {
  return new Decimal(this.$value.multiply(r.$value));
}
Decimal.prototype.$div = function(r) {
  return new Decimal(this.$value.divide(r.$value));
}
Decimal.prototype.$pow = function(r) {
  return new Decimal(this.$value.pow(r.$value));
}



// --[ Operators ]-----------------------------------------------------
function equal(l, r) {
  switch (types(l, r)) {
    case 'string:string':
    case 'float:float':
    case 'bool:bool':
      return l === r;

    case 'integer:integer':
    case 'decimal:decimal':
    case 'adt:adt':
    case 'vector:vector':
    case 'set:set':
    case 'map:map':
      return l.$equals(r);

    default:
      throw new TypeError(`=== not supported for ${l} and ${r}`);
  }
}

function notEqual(l, r) {
  switch (types(l, r)) {
    case 'string:string':
    case 'float:float':
    case 'bool:bool':
      return l !== r;

    case 'integer:integer':
    case 'decimal:decimal':
    case 'adt:adt':
    case 'vector:vector':
    case 'set:set':
    case 'map:map':
      return !l.$equals(r);

    default:
      throw new TypeError(`=== not supported for ${l} and ${r}`);
  }
}

function or(l, r) {
  switch (types(l, r)) {
    case 'bool:bool':
      return l || r;

    default:
      throw new TypeError(`|| not supported for ${l} and ${r}`);
  }
}

function and(l, r) {
  switch (types(l, r)) {
    case 'bool:bool':
      return l && r;

    default:
      throw new TypeError(`&& not supported for ${l} and ${r}`);
  }
}

function greaterThan(l, r) {
  switch (types(l, r)) {
    case 'float:float':
      return l > r;

    case 'integer:integer':
    case 'decimal:decimal':
      return l.$compare(r) > 0;

    default:
      throw new TypeError(`> not supported for ${l} and ${r}`);
  }
}

function greaterOrEqualTo(l, r) {
  switch (types(l, r)) {
    case 'float:float':
      return l >= r;

    case 'integer:integer':
    case 'decimal:decimal':
      return l.$compare(r) >= 0;

    default:
      throw new TypeError(`>= not supported for ${l} and ${r}`);
  }
}

function lessThan(l, r) {
  switch (types(l, r)) {
    case 'float:float':
      return l < r;

    case 'integer:integer':
    case 'decimal:decimal':
      return l.$compare(r) < 0;

    default:
      throw new TypeError(`< not supported for ${l} and ${r}`);
  }
}

function lessOrEqualTo(l, r) {
  switch (types(l, r)) {
    case 'float:float':
      return l <= r;

    case 'integer:integer':
    case 'decimal:decimal':
      return l.$compare(r) <= 0;

    default:
      throw new TypeError(`<= not supported for ${l} and ${r}`);
  }
}

function plus(l, r) {
  switch (types(l, r)) {
    case 'float:float':
      return l + r;

    case 'integer:integer':
    case 'decimal:decimal':
      return l.$add(r);

    default:
      throw new TypeError(`+ not supported for ${l} and ${r}`);
  }
}

function minus(l, r) {
  switch (types(l, r)) {
    case 'float:float':
      return l - r;

    case 'integer:integer':
    case 'decimal:decimal':
      return l.$minus(r);

    default:
      throw new TypeError(`- not supported for ${l} and ${r}`);
  }
}

function times(l, r) {
  switch (types(l, r)) {
    case 'float:float':
      return l * r;

    case 'integer:integer':
    case 'decimal:decimal':
      return l.$times(r);

    default:
      throw new TypeError(`* not supported for ${l} and ${r}`);
  }
}

function div(l, r) {
  switch (types(l, r)) {
    case 'float:float':
      return l / r;

    case 'integer:integer':
    case 'decimal:decimal':
      return l.$div(r);

    default:
      throw new TypeError(`/ not supported for ${l} and ${r}`);
  }
}

function pow(l, r) {
  switch (types(l, r)) {
    case 'float:float':
      return Math.pow(l, r);

    case 'integer:integer':
    case 'decimal:decimal':
      return l.$pow(r);

    default:
      throw new TypeError(`^ not supported for ${l} and ${r}`);
  }
}

function not(l) {
  switch getType(l) {
    case 'boolean':
      return !l;

    default:
      throw new TypeError(`~ not supported for ${l} and ${r}`);
  }
}


// --[ Result ]--------------------------------------------------------
const Result = {};
Result.Ok = variant(['value'], function(value) {
  if (arguments.length !== 1) {
    throw new TypeError(`Expected 1 argument, given ${arguments.length}`);
  }
  if (!(this instanceof Result.Ok)) {
    return new Result.Ok(value);
  }
  this.value = value;
});

Result.Error = variant(['error'], function(error) {
  if (arguments.length !== 1) {
    throw new TypeError(`Expected 1 argument, given ${arguments.length}`);
  }
  if (!(this instanceof Result.Error)) {
    return new Result.Error(error);
  }
  this.error = error;
});

const none = Result.Error("No value");


// --[ Utilities ]-----------------------------------------------------
function doImport(require, module, args) {
  const instance = require(module);
  let mod;
  if (instance.$canelesModule) {
    mod = instance(runtime)
  } else {
    mod = instance;
  }

  if (args != null) {
    return mod(...args);
  } else {
    return mod;
  }
};

function makeModule() {
  return Object.create(null);
}

// --[ Union ]--------------------------------------------------------
function variant(fields, fn) {
  fn.$type = 'adt-tag';
  fn.$unapply = function(value) {
    if (value instanceof fn) {
      return fields.map(k => value[k]);
    } else {
      return null;
    }
  };

  fn.prototype.$type = 'adt';
  fn.prototype.$equals = function(value) {
    if (value instanceof fn) {
      return fields.every(k => equal(this[k], value[k]));
    } else {
      return false;
    }
  }

  return fn;
}

function extractorUnapply(tag, value) {
  switch (getType(tag)) {
    case 'adt-tag':
      return tag.$unapply(value)

    default:
      throw new TypeError(`${tag} is not a Variant and can't be used for destructuring pattern matching.`);
  }
}

function getter(name, fn) {
  return { type: 'getter', name: name, fn: fn }
}

function method(name, fn) {
  return { type: 'method', name: name, fn: fn }
}

function setter(name, fn) {
  return { type: 'setter', name: name, fn: fn }
}

function object(properties) {
  const result = Object.create(null);

  result.refine = function(props) {
    let res = Object.create(null);
    Object.getOwnPropertyNames(props).forEach(k =>
      Object.defineProperty(res, k, Object.getOwnPropertyDescriptor(props, k))
    );
    res.$fields = new Set([...this.$fields.values(), ...props.$fields.values()])
    return res;
  }

  result.toString = function() {
    return "<Object>";
  }

  properties.forEach(p => {
    let d = Object.getOwnPropertyDescriptor(result, p.name);
    if (!d) {
      d = {
        writable: true,
        configurable: true,
        enumerable: false
      }
    };
    switch (p.type) {
      case 'getter': d.get = p.fn;
      case 'setter': d.set = p.fn;
      case 'method': d.value = p.fn;
    }
    Object.defineProperty(result, p.name, d);
  });

  const fields = new Set(properties.filter(p => p.type !== 'method').map(p => p.name));
  result.$fields = fields;

  return result;
}

function doGet(object, property) {
  if (!object.$fields.has(property)) {
    throw new TypeError(`${object} has no field ${property}`);
  }
  return object[property];
}

function doSet(object, property, value) {
  if (!object.$fields.has(property)) {
    throw new TypeError(`${object} has no field ${property}`)
  }
  return object[property] = value;
}

function at(object, index) {
  switch (getType(object)) {
    case 'vector':
      const x1 = object.get(+index);
      if (x1 === undefined) {
        return none
      } else {
        return Result.Ok(x1);
      }

    case 'map':
      const x2 = object.get(index);
      if (x2 === undefined) {
        return none
      } else {
        return Result.Ok(x2);
      }

    default:
      throw new TypeError(`${object} does not support the indexing operation []`);
  }
}



// --[ Exports ]-------------------------------------------------------
module.exports = {
  equal, notEqual,
  or, and, not,
  greaterThan, greaterOrEqualTo, lessThan, lessOrEqualTo,
  plus, times, dividedBy: div, power: pow,

  integer(v) {
    return new Integer(v)
  },
  decimal(v) {
    return new Decimal(v)
  },
  vector(v) {
    return new IVector(v)
  },
  "set"(v) {
    return new ISet(v)
  },
  map(v) {
    return new IMap(v)
  },

  variant, extractorUnapply: unapply,
  object, getter, setter, method,
  "getField": doGet, "assignField": doSet, at,

  ok: Result.Ok, error: Result.Error, none,

  selectRuntime(language) {
    return this;
  },
  module: makeModule,
  import: doImport
}
