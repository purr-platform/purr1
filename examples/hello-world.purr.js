
module.exports = function($platform) {
  const $rt = $platform.runtime;
  
  $rt.$module("hello_world", ($self) => {
    $rt.$use($self, "purr.core.prelude", ["display","+","trace"])
    $rt.$public($self, ["main"]);
    $rt.$record($self, "Greeting", ["who","message"]);
    $rt.$method($self, "say:to:", [null, null], (...$in) => {
      return $rt.$scope($self, ($self) => {
        $rt.$scope_apply_params($self, ["message","who"], $in);
        return $rt.$new($self, $rt.$deref($self, "Greeting"), [["who", $rt.$deref($self, "who")], ["message", $rt.$deref($self, "message")]]);
      });
    });
    $rt.$thunk($self, "main", () => $rt.$match($self, $rt.$method_call($self, "trace", [$rt.$method_call($self, "say:to:", [$rt.$text("Hello"), $rt.$text("World")])]), [$rt.$match_case($rt.$pattern.$unapply($rt.$deref($self, "Greeting"), [["who", $rt.$pattern.$bind("who")], ["message", $rt.$pattern.$bind("message")]]), ($self) => $rt.$method_call($self, "display", [$rt.$method_call($self, "+", [$rt.$method_call($self, "+", [$rt.$deref($self, "message"), $rt.$text(", ")]), $rt.$deref($self, "who")])])), $rt.$match_case($rt.$pattern.$any, ($self) => $rt.$method_call($self, "display", [$rt.$text("wat")]))]));
  });
};
  