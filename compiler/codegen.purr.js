
module.exports = function($platform) {
  const $rt = $platform.runtime;
  
  $rt.$module("purr.core.codegen", ($self) => {
    $rt.$public($self, ["DeclarationType","AST","generate"]);
    $rt.$union($self, "DeclarationType", [
      $rt.$case("Var", []),
      $rt.$case("Let", []),
      $rt.$case("Const", [])
    ]);
    $rt.$union($self, "AST", [
      $rt.$case("RawIdentifier", ["name"]),
      $rt.$case("Identifier", ["name"]),
      $rt.$case("Spread", ["identifier"]),
      $rt.$case("Assignment", ["l_value","r_value"]),
      $rt.$case("Member", ["object","property"]),
      $rt.$case("Lambda", ["parameters","body"]),
      $rt.$case("Declaration", ["type","l_value","r_value"]),
      $rt.$case("Return", ["expression"]),
      $rt.$case("Call", ["callee","arguments"]),
      $rt.$case("Conditional", ["test","consequent","alternate"]),
      $rt.$case("Text", ["value"]),
      $rt.$case("Vector", ["items"]),
      $rt.$case("Bool", ["value"])
    ]);
    $rt.$union($self, "Document", [
      $rt.$case("Block", ["indentation","elements"]),
      $rt.$case("Flow", ["elements"]),
      $rt.$case("Element", ["text"])
    ]);
    $rt.$method($self, "_:l:", ["elements"], (...$in) => {
      return $rt.$scope($self, ($self) => {
        $rt.$scope_apply_params($self, ["elements"], $in);
        return $rt.$new($self, $rt.$project($self, $rt.$deref($self, "Document"), "Flow"), [["elements", $rt.$deref($self, "elements")]]);
      });
    });
    $rt.$method($self, "_:e:", ["text"], (...$in) => {
      return $rt.$scope($self, ($self) => {
        $rt.$scope_apply_params($self, ["text"], $in);
        return $rt.$new($self, $rt.$project($self, $rt.$deref($self, "Document"), "Element"), [["text", $rt.$deref($self, "text")]]);
      });
    });
    $rt.$method($self, "_:n:l:", ["n","xs"], (...$in) => {
      return $rt.$scope($self, ($self) => {
        $rt.$scope_apply_params($self, ["n","xs"], $in);
        return $rt.$new($self, $rt.$project($self, $rt.$deref($self, "Document"), "Block"), [["indentation", $rt.$deref($self, "n")], ["elements", $rt.$deref($self, "xs")]]);
      });
    });
    $rt.$method($self, "_:t:e:", ["document","n"], (...$in) => {
      return $rt.$scope($self, ($self) => {
        $rt.$scope_apply_params($self, ["document","n"], $in);
        return $rt.$match($self, $rt.$deref($self, "document"), [$rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "Document"), "Element"), [["text", $rt.$pattern.$bind("text")]]), ($self) => $rt.$deref($self, "text")), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "Document"), "Flow"), [["elements", $rt.$pattern.$bind("elements")]]), ($self) => $rt.$method_call($self, "_:join:", [$rt.$deref($self, "elements"), $rt.$text("")])), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "Document"), "Block"), [["indentation", $rt.$pattern.$bind("indentation")], ["elements", $rt.$pattern.$bind("elements")]]), ($self) => $rt.$let($self, "indent", $rt.$method_call($self, "_:repeated:", [$rt.$text(" "), $rt.$method_call($self, "+", [$rt.$deref($self, "indentation"), $rt.$deref($self, "n")])]), ($self) => $rt.$let($self, "first_indent", $rt.$method_call($self, "_:repeated:", [$rt.$text(" "), $rt.$deref($self, "indentation")]), ($self) => $rt.$method_call($self, "+", [$rt.$method_call($self, "+", [$rt.$method_call($self, "+", [$rt.$text("\n"), $rt.$deref($self, "first_indent")]), $rt.$method_call($self, "_:join:", [$rt.$deref($self, "elements"), $rt.$method_call($self, "+", [$rt.$text("\n"), $rt.$deref($self, "indent")])])]), $rt.$text("\n")]))))]);
      });
    });
    $rt.$method($self, "generate", ["ast"], (...$in) => {
      return $rt.$scope($self, ($self) => {
        $rt.$scope_apply_params($self, ["ast"], $in);
        return $rt.$method_call($self, "stringify:depth:", [$rt.$method_call($self, "as_doc", [$rt.$deref($self, "ast")]), $rt.$int32("+", "0")]);
      });
    });
    $rt.$method($self, "as_doc", ["ast"], (...$in) => {
      return $rt.$scope($self, ($self) => {
        $rt.$scope_apply_params($self, ["ast"], $in);
        return $rt.$match($self, $rt.$deref($self, "ast"), [$rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "RawIdentifier"), [["name", $rt.$pattern.$bind("name")]]), ($self) => $rt.$method_call($self, "text:", [$rt.$deref($self, "name")])), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Identifier"), [["name", $rt.$pattern.$bind("name")]]), ($self) => $rt.$method_call($self, "text:", [$rt.$method_call($self, "mangled", [$rt.$deref($self, "name")])])), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Spread"), [["identifier", $rt.$pattern.$bind("identifier")]]), ($self) => $rt.$method_call($self, "flow:", [$rt.$vector([$rt.$method_call($self, "text:", [$rt.$text("...")]), $rt.$method_call($self, "text:", [$rt.$method_call($self, "as_doc", [$rt.$deref($self, "identifier")])])])])), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Assignment"), [["l_value", $rt.$pattern.$bind("l_value")], ["r_value", $rt.$pattern.$bind("r_value")]]), ($self) => $rt.$method_call($self, "flow:", [$rt.$vector([$rt.$method_call($self, "as_doc", [$rt.$deref($self, "l_value")]), $rt.$method_call($self, "text:", [$rt.$text(" = ")]), $rt.$method_call($self, "as_doc", [$rt.$deref($self, "r_value")])])])), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Member"), [["object", $rt.$pattern.$bind("object")], ["property", $rt.$pattern.$bind("property")]]), ($self) => $rt.$method_call($self, "flow:", [$rt.$vector([$rt.$method_call($self, "as_doc", [$rt.$deref($self, "object")]), $rt.$method_call($self, "text:", [$rt.$text(".")]), $rt.$method_call($self, "as_doc", [$rt.$deref($self, "property")])])])), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Lambda"), [["parameters", $rt.$pattern.$bind("parameters")], ["body", $rt.$pattern.$bind("body")]]), ($self) => $rt.$let($self, "params", $rt.$method_call($self, "_:intersperse:", [$rt.$method_call($self, "_:map:", [$rt.$deref($self, "parameters"), $rt.$closure(["x"], (...$in) => {
  return $rt.$scope($self, ($self) => {
    $rt.$scope_apply_params($self, ["x"], $in);
    return $rt.$method_call($self, "as_doc", [$rt.$deref($self, "x")]);
  });
})]), $rt.$method_call($self, "text:", [$rt.$text(", ")])]), ($self) => $rt.$method_call($self, "flow:", [$rt.$vector([$rt.$method_call($self, "text:", [$rt.$text("function(")]), $rt.$deref($self, "params"), $rt.$method_call($self, "text:", [$rt.$text(") {")]), $rt.$method_call($self, "indent:block:", [$rt.$int32("+", "2"), $rt.$method_call($self, "_:map:", [$rt.$deref($self, "body"), $rt.$closure(["x"], (...$in) => {
  return $rt.$scope($self, ($self) => {
    $rt.$scope_apply_params($self, ["x"], $in);
    return $rt.$method_call($self, "as_doc", [$rt.$deref($self, "x")]);
  });
})])]), $rt.$method_call($self, "text:", [$rt.$text("}")])])]))), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Declaration"), [["type", $rt.$pattern.$bind("type")], ["l_value", $rt.$pattern.$bind("l_value")], ["r_value", $rt.$pattern.$bind("r_value")]]), ($self) => $rt.$let($self, "token", $rt.$match($self, $rt.$deref($self, "type"), [$rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "DeclarationType"), "Var"), []), ($self) => $rt.$text("var")), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "DeclarationType"), "Let"), []), ($self) => $rt.$text("let")), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "DeclarationType"), "Const"), []), ($self) => $rt.$text("const"))]), ($self) => $rt.$method_call($self, "flow:", [$rt.$vector([$rt.$deref($self, "token"), $rt.$method_call($self, "text:", [$rt.$text(" ")]), $rt.$method_call($self, "as_doc", [$rt.$deref($self, "l_value")]), $rt.$method_call($self, "text:", [$rt.$text(" = ")]), $rt.$method_call($self, "as_doc", [$rt.$deref($self, "r_value")])])]))), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Return"), [["expression", $rt.$pattern.$bind("expression")]]), ($self) => $rt.$method_call($self, "flow:", [$rt.$vector([$rt.$method_call($self, "text:", [$rt.$text("return ")]), $rt.$method_call($self, "as_doc", [$rt.$deref($self, "expression")])])])), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Call"), [["callee", $rt.$pattern.$bind("callee")], ["arguments", $rt.$pattern.$bind("arguments")]]), ($self) => $rt.$let($self, "args", $rt.$method_call($self, "_:intersperse:", [$rt.$method_call($self, "_:map:", [$rt.$deref($self, "arguments"), $rt.$closure(["x"], (...$in) => {
  return $rt.$scope($self, ($self) => {
    $rt.$scope_apply_params($self, ["x"], $in);
    return $rt.$method_call($self, "as_doc", [$rt.$deref($self, "x")]);
  });
})]), $rt.$method_call($self, "text:", [$rt.$text(", ")])]), ($self) => $rt.$method_call($self, "flow:", [$rt.$vector([$rt.$method_call($self, "text:", [$rt.$text("(")]), $rt.$method_call($self, "as_doc", [$rt.$deref($self, "callee")]), $rt.$method_call($self, "text:", [$rt.$text(")(")]), $rt.$deref($self, "args"), $rt.$method_call($self, "text:", [$rt.$text(")")])])]))), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Conditional"), [["test", $rt.$pattern.$bind("test")], ["consequent", $rt.$pattern.$bind("consequent")], ["alternate", $rt.$pattern.$bind("alternate")]]), ($self) => $rt.$method_call($self, "flow:", [$rt.$vector([$rt.$method_call($self, "text:", [$rt.$text("(")]), $rt.$method_call($self, "as_doc", [$rt.$deref($self, "test")]), $rt.$method_call($self, "text:", [$rt.$text(")")]), $rt.$method_call($self, "indent:block:", [$rt.$int32("+", "2"), $rt.$vector([$rt.$method_call($self, "flow:", [$rt.$vector([$rt.$method_call($self, "text:", [$rt.$text("? (")]), $rt.$method_call($self, "as_doc", [$rt.$deref($self, "consequent")]), $rt.$method_call($self, "text:", [$rt.$text(")")])])]), $rt.$method_call($self, "flow:", [$rt.$vector([$rt.$method_call($self, "text:", [$rt.$text(": (")]), $rt.$method_call($self, "as_doc", [$rt.$deref($self, "alternate")]), $rt.$method_call($self, "text:", [$rt.$text(")")])])])])])])])), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Text"), [["value", $rt.$pattern.$bind("value")]]), ($self) => $rt.$method_call($self, "escape_js_string:", [$rt.$deref($self, "value")])), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Vector"), [["items", $rt.$pattern.$bind("items")]]), ($self) => $rt.$let($self, "gen_items", $rt.$method_call($self, "_:intersperse:", [$rt.$method_call($self, "_:map:", [$rt.$deref($self, "items"), $rt.$closure(["x"], (...$in) => {
  return $rt.$scope($self, ($self) => {
    $rt.$scope_apply_params($self, ["x"], $in);
    return $rt.$method_call($self, "as_doc", [$rt.$deref($self, "x")]);
  });
})]), $rt.$method_call($self, "text:", [$rt.$text(", ")])]), ($self) => $rt.$method_call($self, "flow:", [$rt.$vector([$rt.$method_call($self, "text:", [$rt.$text("[")]), $rt.$deref($self, "gen_items"), $rt.$method_call($self, "text:", [$rt.$text("]")])])]))), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Bool"), [["value", $rt.$pattern.$equal($rt.$text("true"))]]), ($self) => $rt.$method_call($self, "text:", [$rt.$text("true")])), $rt.$match_case($rt.$pattern.$unapply($rt.$project($self, $rt.$deref($self, "AST"), "Bool"), [["value", $rt.$pattern.$equal($rt.$text("false"))]]), ($self) => $rt.$method_call($self, "text:", [$rt.$text("false")]))]);
      });
    });
  });
};
  