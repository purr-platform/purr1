module.exports = function($platform) {
  const rt = $platform.runtime;

  function makeModule(name, methods) {
    rt.$module(name, ($self) => {
      for (const [sig, v] of Object.entries(methods)) {
        rt.$public($self, [sig]);
        v($self, sig);
      }
    });
  }

  function meth(params, fn) {
    return ($self, name) => {
      rt.$method($self, name, params, fn($self));
    };
  }

  function data(value) {
    return ($self, name) => {
      $self.put(name, value);
    };
  }

  const Text = {
    hasInstance(x) { return typeof x === 'string' }
  };

  const Bool = {
    hasInstance(x) { return typeof x === 'boolean' }
  };

  const Int = {
    hasInstance(x) { return typeof x === 'number' && (x | 0) === x }
  };

  const Dec = {
    hasInstance(x) { return typeof x === 'number' }
  };

  const Vector = {
    hasInstance(x) { return Array.isArray(x) }
  };


  makeModule('purr.vm.primitives', {
    Text: data(Text),
    Bool: data(Bool),
    Integer_32bit: data(Int),
    Decimal_64bit: data(Dec),
    Vector: data(Vector),

    '+': meth([Dec, Dec], _ => (a, b) => a + b),
    '+': meth([Text, Text], _ => (a, b) => a + b),
    '+': meth([Vector, Vector], _ => (a, b) => a.concat(b)),

    '-': meth([Dec, Dec], _ => (a, b) => a - b),
    '*': meth([Dec, Dec], _ => (a, b) => a * b),
    '/': meth([Dec, Dec], _ => (a, b) => a / b),

    '===': meth([Dec, Dec], _ => (a, b) => a === b),
    '===': meth([Text, Text], _ => (a, b) => a === b),
    '===': meth([Bool, Bool], _ => (a, b) => a === b),
    '===': meth([Vector, Vector], s => (a, b) => 
      a.length === b.length && a.every((x, i) => rt.$method_call(s, '===', [x, b[i]]))),

    '=/=': meth([Dec, Dec], _ => (a, b) => a !== b),
    '=/=': meth([Text, Text], _ => (a, b) => a !== b),
    '=/=': meth([Bool, Bool], _ => (a, b) => a !== b),
    '=/=': meth([Vector, Vector], s => (a, b) => 
      a.length !== b.length || a.some((x, i) => rt.$method_call(s, '=/=', [x, b[i]]))),
    
    '>': meth([Dec, Dec], _ => (a, b) => a > b),
    '<': meth([Dec, Dec], _ => (a, b) => a < b),
    '>=': meth([Dec, Dec], _ => (a, b) => a >= b),
    '<=': meth([Dec, Dec], _ => (a, b) => a <= b),
    
  });
}