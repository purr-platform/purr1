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
  
  const prim = {
    $project: (k) => get('<Purr Primitives>', prim, k),
    Bool,

    
    display: (x) => 
      console.log(util.inspect(x, false, Infinity, true)),
    
    trace: (x) => { 
      console.log(`(TRACE)\n`, util.inspect(x, false, 5, true), '\n---'); 
      return x 
    },
    
    panic: (e) => {
      throw new Error(e);
    }
  };

  return prim;
};