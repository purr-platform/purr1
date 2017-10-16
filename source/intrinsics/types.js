module.exports = ($platform) => {
  const $rt = $platform.runtime;
  const im = require('immutable');

  $rt.$module('purr.intrinsics.types', {}, ($self) => {
    $self.put('Boolean', {
      hasInstance: (x) => typeof x === 'boolean'
    });

    $self.put('Integer', {
      hasInstance: (x) => $rt.isInt(x)
    });

    $self.put('Decimal', {
      hasInstance: (x) => typeof x === 'number'
    });

    $self.put('Text', {
      hasInstance: (x) => typeof x === 'string'
    });

    $self.put('Tuple', {
      hasInstance: (x) => Array.isArray(x)
    });

    $self.put('Vector', {
      hasInstance: (x) => im.List.isList(x)
    });

    $self.put('Set', {
      hasInstance: (x) => im.Set.isSet(x)
    });

    $self.put('Map', {
      hasInstance: (x) => im.Map.isMap(x)
    });

    $rt.$public($self, Object.keys($self.getScope().bindings));
  });
};