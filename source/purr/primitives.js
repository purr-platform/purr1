// Note that this module is unsafe, all type checking
// is expected to be provided by the modules using this.
module.exports = function($platform) {
  const $rt = $platform.runtime;
  const util = require('util');


  //region Helpers
  function assert(test, message) {
    if (!test) {
      throw new Error(message);
    }
  }

  function get(n, o, k) {
    if (!o.hasOwnProperty(k)) {
      throw new Error(`Can't project ${k} from ${n}`);
    }
    return o[k];
  }
  //endregion


  //region Boolean
  const Bool = {
    $project: (k) => get('Bool', Bool, k),
    Boolean: {
      $project: (k) => get('Boolean', Bool.Boolean, k),
      hasInstance: (x) => typeof x === 'boolean',
      type: {
        hasInstance: (x) => x === Bool.Boolean
      }
    },
    
    eq: (a, b) => a === b,
    neq: (a, b) => a !== b,
    and: (a, b) => a && b,
    or: (a, b) => a || b,
    not: (a) => !a
  };
  //endregion


  //region Integer
  const Int = {
    $project: (k) => get('Int', Int, k),
    Integer: {
      $project: (k) => get('Integer', Int.Integer, k),
      hasInstance: (x) => x instanceof $rt.BigInteger,
      type: {
        hasInstance: (x) => x === Int.Integer
      }
    },

    add: (a, b) => a.add(b),
    eq: (a, b) => a.compareTo(b) === 0,
    neq: (a, b) => a.compareTo(b) !== 0,
    div: (a, b) => a.divide(b),
    mul: (a, b) => a.multiply(b),
    not: (a) => a.negate(),
    sub: (a, b) => a.subtract(b)
  };
  //endregion

  //region Text
  const Text = {
    $project: (k) => get('Text', Text, k),
    Text: {
      $project: (k) => get('Text', Text.Text, k),
      hasInstance: (x) => typeof x === 'string',
      type: {
        hasInstance: (x) => x === Text.Text
      }
    },

    eq: (a, b) => a === b,
    neq: (a, b) => a !== b,
    concat: (a, b) => a + b,
    includes: (a, b) => a.includes(b),
    starts_with: (a, b) => a.startsWith(b),
    ends_with: (a, b) => a.endsWith(b),
    trim: (a) => a.trim(),
    trim_left: (a) => a.trimLeft(),
    trim_right: (a) => a.trimRight(),
    upcase: (a) => a.toUpperCase(),
    downcase: (a) => a.toLowerCase(),
    split: (a, s) => a.split(s),
    split_limit: (a, s, l) => a.split(s, l)
  }
  //endregion
  
  const prim = {
    $project: (k) => get('<Purr Primitives>', prim, k),
    Bool,
    Int,
    Text,

    
    display: (x) => console.log($rt.show(x)),
    
    trace: (x) => { 
      console.log('(TRACE)');
      if (process.env.TRACE_JS) {
        console.log(util.inspect(x, false, 5, true));
      }
      console.log($rt.show(x));
      console.log('---');
      return x 
    },
    
    panic: (e) => {
      throw new Error(e);
    }
  };

  return prim;
};