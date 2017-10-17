const { BigInteger } = require('bigdecimal');

module.exports = {
  fac_float: function f(n) {
    if (n <= 1) { 
      return 1 
    }
    else {
      return f(n - 1) * n;
    }
  },

  fac_int: (x) => {
    const one = new BigInteger('1');
    const f = (n) => {
      if (n.compareTo(one) <= 0) {
        return one;
      } else {
        return f(n.subtract(one)).multiply(n);
      }
    };

    return f(x.value);
  }
};