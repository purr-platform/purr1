module.exports = ($platform) => {
  const $rt = $platform.runtime;
  const { BigInteger } = require('bigdecimal');
  const im = require('immutable');

  $rt.$module('purr.intrinsics.primitives', {}, ($self) => {
    $self.put('bool_eq', (a, b) => a === b);
    $self.put('bool_neq', (a, b) => a !== b);
    $self.put('bool_and', (a, b) => a && b);
    $self.put('bool_or', (a, b) => a || b);
    $self.put('bool_not', (a) => !a);

    $self.put('int_eq', (a, b) => a.equals(b));
    $self.put('int_neq', (a, b) => !a.equals(b));
    $self.put('int_add', (a, b) => new $rt.Integer(a.value.add(b.value)));
    $self.put('int_sub', (a, b) => new $rt.Integer(a.value.subtract(b.value)));
    $self.put('int_not', (a) => new $rt.Integer(a.value.negate()));
    $self.put('int_div', (a, b) => new $rt.Integer(a.value.divide(b.value)));
    $self.put('int_mul', (a, b) => new $rt.Integer(a.value.multiply(b.value)));
    $self.put('int_lt', (a, b) => a.value.compareTo(b.value) < 0);
    $self.put('int_gt', (a, b) => a.value.compareTo(b.value) > 0);
    $self.put('int_lte', (a, b) => a.value.compareTo(b.value) <= 0);
    $self.put('int_gte', (a, b) => a.value.compareTo(b.value) >= 0);
    

    $self.put('text_eq', (a, b) => a.normalize() === b.normalize());
    $self.put('text_neq', (a, b) => a.normalize() !== b.normalize());
    $self.put('text_concat', (a, b) => a + b);
    $self.put('text_includes', (a, b) => a.normalize().includes(b.normalize()));
    $self.put('text_starts_with', (a, b) => a.normalize().startsWith(b.normalize()));
    $self.put('text_ends_with', (a, b) => a.normalize().endsWith(b.normalize()));
    $self.put('text_trim', (a) => a.trim());
    $self.put('text_trim_left', (a) => a.trimLeft());
    $self.put('text_trim_right', (a) => a.trimRight());

    $self.put('vec_eq', (a, b) => a.equals(b));
    $self.put('vec_neq', (a, b) => !a.equals(b));
    $self.put('vec_at', (a, i) => a.get(i.value.floatValue() + 1));
    $self.put('vec_size', (a) => new $rt.Integer(new BigInteger(a.size.toString())));
    $self.put('vec_concat', (a, b) => a.concat(b));
    $self.put('vec_map', (a, b) => a.map(b));
    $self.put('vec_flatmap', (a, b) => a.flatMap(b));
    $self.put('vec_filter', (a, b) => a.filter(b));
    $self.put('vec_zip', (a, b) => a.zip(b));
    $self.put('vec_zipwith', (a, b, f) => a.zipWith(f, b));
    $self.put('vec_sort', (a, f) => a.sort((a, b) => { return f(a, b).value.floatValue() }));


    $self.put('eq', (a, b) => $rt.eq(a, b));
    $self.put('show', (a) => $rt.show(a));
    $self.put('indent', (n, a) => a.split(/\r\n|\r|\n/).map(x => `${" ".repeat(n)}${x}`).join('\n'));
    $self.put('panic', (e) => { throw new Error(e) });

    $rt.$public($self, Object.keys($self.getScope().bindings));
  });
};