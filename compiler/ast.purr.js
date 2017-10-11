
module.exports = function($platform) {
  const $rt = $platform.runtime;
  
  $rt.$module("purr.core.ast", ($self) => {
    $rt.$public($self, ["Module","Interface_Specifier","Name","Qualified_Name","Declaration","Field","Variant","Binding_Specifier","Method_Parameter","Method_Dispatch","Expression","Case","Pattern","Version"]);
    $rt.$record($self, "Module", ["interface","metadata","declarations"]);
    $rt.$record($self, "Interface_Specifier", ["name","version"]);
    $rt.$record($self, "Name", ["name"]);
    $rt.$record($self, "Qualified_Name", ["names"]);
    $rt.$record($self, "Version", ["minor","major","patch"]);
    $rt.$union($self, "Declaration", [
      $rt.$case("Record", ["name","fields"]),
      $rt.$case("Union", ["name","variants"]),
      $rt.$case("Public", ["bindings"]),
      $rt.$case("Use", ["interface","bindings"]),
      $rt.$case("Method", ["signature","parameters","body"]),
      $rt.$case("Annotation", []),
      $rt.$case("Section", [])
    ]);
    $rt.$record($self, "Field", ["name","contract","default"]);
    $rt.$record($self, "Variant", ["tag","fields"]);
    $rt.$record($self, "Binding_Specifier", ["name","alias"]);
    $rt.$record($self, "Method_Parameter", ["name","dispatch","default"]);
    $rt.$union($self, "Method_Dispatch", [
      $rt.$case("Any", []),
      $rt.$case("Tag", ["expression"])
    ]);
    $rt.$union($self, "Expression", [
      $rt.$case("Integer", ["sign","digits"]),
      $rt.$case("Decimal", ["sign","integer","decimal"]),
      $rt.$case("Rational", ["sign","numerator","denominator"]),
      $rt.$case("Integer_32bit", ["sign","digits"]),
      $rt.$case("Decimal_64bit", ["sign","integer","decimal"]),
      $rt.$case("Boolean", ["value"]),
      $rt.$case("Text", ["value"]),
      $rt.$case("Vector", ["items"]),
      $rt.$case("Closure", ["parameters","expression"]),
      $rt.$case("If", ["condition","consequent","alternate"]),
      $rt.$case("Let", ["name","value","expression"]),
      $rt.$case("New", ["structure","fields"]),
      $rt.$case("Dispatch", ["signature","arguments"]),
      $rt.$case("Call", ["callee","arguments"]),
      $rt.$case("Project", ["structure","field"]),
      $rt.$case("Variable", ["name"]),
      $rt.$case("Match", ["value","cases"])
    ]);
    $rt.$record($self, "Case", ["pattern","constraint","expression"]);
    $rt.$union($self, "Pattern", [
      $rt.$case("Any", []),
      $rt.$case("Equals", ["expression"]),
      $rt.$case("Bind", ["name"]),
      $rt.$case("Unapply", ["extractor","fields"]),
      $rt.$case("Vector", ["items","spread"])
    ]);
  });
};
  