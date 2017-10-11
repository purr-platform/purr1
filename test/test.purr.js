
module.exports = function($platform) {
  const $rt = $platform.runtime;
  
  $rt.$module("purr.test", { file: __filename, dir: __dirname, require: require }, ($self) => {
    $self.put("self", $self);
    $rt.$public($self, ["main"]);
    $rt.$use($self, "purr.core.parser", ["parse"])
    $rt.$use($self, "purr.prelude", ["lines","unlines","read_file","display","_ drop:","size","_ resource:"])
    $rt.$thunk($self, "main", () => $rt.$let($self, "data", $rt.$method_call($self, "_ resource:", [$rt.$deref($self, "self"), $rt.$text("ast.purr")]), ($self) => $rt.$let($self, "source", $rt.$method_call($self, "unlines", [$rt.$method_call($self, "_ drop:", [$rt.$method_call($self, "lines", [$rt.$deref($self, "data")]), $rt.$int32("+", "1")])]), ($self) => $rt.$method_call($self, "display", [$rt.$method_call($self, "parse", [$rt.$deref($self, "source")])]))));
  });
};
  