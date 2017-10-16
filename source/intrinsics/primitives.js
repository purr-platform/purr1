module.exports = ($platform) => {
  const $rt = $platform.runtime;
  const im = require('immutable');

  $rt.$module('purr.intrinsics.primitives', {}, ($self) => {
    $self.put('bool_eq', (a, b) => a === b);
    $self.put('bool_neq', (a, b) => a !== b);
    $self.put('bool_and', (a, b) => a && b);
    $self.put('bool_or', (a, b) => a || b);
    $self.put('bool_not', (a) => !a);

    $self.put('int_eq', (a, b) => a.compareTo(b) === 0);
    $self.put('int_neq', (a, b) => a.compareTo(b) !== 0);
    $self.put('int_add', (a, b) => a.add(b));
    $self.put('int_sub', (a, b) => a.subtract(b));
    $self.put('int_not', (a) => a.negate());
    $self.put('int_div', (a, b) => a.divide(b));
    $self.put('int_mul', (a, b) => a.multiply(b));

    $self.put('text_eq', (a, b) => a.normalize() === b.normalize());
    $self.put('text_neq', (a, b) => a.normalize() !== b.normalize());
    $self.put('text_concat', (a, b) => a + b);
    $self.put('text_includes', (a, b) => a.normalize().includes(b.normalize()));
    $self.put('text_starts_with', (a, b) => a.normalize().startsWith(b.normalize()));
    $self.put('text_ends_with', (a, b) => a.normalize().endsWith(b.normalize()));
    $self.put('text_trim', (a) => a.trim());
    $self.put('text_trim_left', (a) => a.trimLeft());
    $self.put('text_trim_right', (a) => a.trimRight());

    $self.put('eq', (a, b) => $rt.eq(a, b));
    $self.put('show', (a) => $rt.show(a));
    $self.put('indent', (n, a) => a.split(/\r\n|\r|\n/).map(x => `${" ".repeat(n)}${x}`).join('\n'));

    $rt.$public($self, Object.keys($self.getScope().bindings));
  });
};