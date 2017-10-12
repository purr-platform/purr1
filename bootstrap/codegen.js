function _(x) {
  return JSON.stringify(x);
}

function m(name) {
  return `u_${name.replace(/[\W]/g, (x => `${x.charCodeAt(0)}`))}`;
}

function Module(id, decl) {
  return `
module.exports = function($platform) {
  const $rt = $platform.runtime;
  
  $rt.$module(${_(id)}, { file: __filename, dir: __dirname, require: require }, function ${m(id)}($self) {
    $self.put("self", $self);
    ${decl.join('\n    ')}
  });
};
  `;
}
exports.Module = Module;


function Record(id, fields) {
  const fs = fields.map(x => x[1]);
  return `$rt.$record($self, ${_(id)}, ${_(fs)})`;
}
exports.Record = Record;


function Union(id, cases) {
  const makeCase = ([tag, fields]) =>
    `$rt.$case(${_(tag)}, ${_(fields.map(x => x[1]))})`;
  
  return `$rt.$union($self, ${_(id)}, [
      ${cases.map(makeCase).join(',\n      ')}
    ])`
}
exports.Union = Union;


function Public(symbols) {
  return `$rt.$public($self, ${_(symbols.map(x => x[1]))});`
}
exports.Public = Public;


function Use(id, symbols) {
  return `$rt.$use($self, ${_(id)}, ${_(symbols)});`;
}
exports.Use = Use;


function Method(sig, args, expr) {
  const params = args.map((x) => x[1] ? `(() => ${x[1]})` : `null`);

  return `$rt.$method($self, ${_(sig)}, [${params.join(', ')}], function ${m(sig)}(...$in) {
      return $rt.$scope($self, ($self) => {
        $rt.$scope_apply_params($self, ${_(args.map(x => x[0]))}, $in);
        return ${expr};
      });
    })`
}
exports.Method = Method;


function Thunk(sig, expr) {
  return `$rt.$thunk($self, ${_(sig)}, function ${m(sig)}() { return ${expr} });`
}
exports.Thunk = Thunk;


function Bool(v) {
  return `$rt.$bool(${_(v)})`;
}
exports.Bool = Bool;


function Int(sign, value) {
  return `$rt.$int(${_(sign)}, ${_(value)})`;
}
exports.Int = Int;


function Dec(sign, integer, decimal) {
  return `$rt.$dec(${_(sign)}, ${_(integer)}, ${_(decimal)})`;
}
exports.Dec = Dec;


function Text(value) {
  return `$rt.$text(${_(value)})`
}
exports.Text = Text;


function Vector(items) {
  return `$rt.$vector([${items.join(', ')}])`
}
exports.Vector = Vector;


function Closure(args, expr) {
  return `$rt.$closure(${_(args.map(x => x[1]))}, (...$in) => {
  return $rt.$scope($self, ($self) => {
    $rt.$scope_apply_params($self, ${_(args.map(x => x[1]))}, $in);
    return ${expr};
  });
})`
}
exports.Closure = Closure;


function IfElse(test, consequent, alternate) {
  return `($rt.$iftrue(${test}) ? ${consequent} : ${alternate})`;
}
exports.IfElse = IfElse;


function Let(bindings, expr) {
  return bindings.reduceRight((expr, [id, value]) => `$rt.$let($self, ${_(id)}, ${value}, ($self) => ${expr})`, expr);
}
exports.Let = Let;


function Match(value, cases) {
  return `$rt.$match($self, ${value}, [${cases.join(', ')}])`;
}
exports.Match = Match;


function Case(pattern, expr) {
  return `$rt.$match_case(${pattern}, ($self) => ${expr})`;
}
exports.Case = Case;


function MCall(signature, args) {
  return `$rt.$method_call($self, ${_(signature)}, [${args.join(', ')}])`;
}
exports.MCall = MCall;


function New(expr, args) {
  const pairs = args.map(([x, y]) => `[${_(x)}, ${y}]`);
  return `$rt.$new($self, ${expr}, [${pairs.join(', ')}])`;
}
exports.New = New;


function Call(callee, args) {
  return `$rt.$call($self, ${callee}, [${args.join(', ')}])`;
}
exports.Call = Call;


function Proj(record, field) {
  return `$rt.$project($self, ${record}, ${_(field)})`;
}
exports.Proj = Proj;


function Deref(name) {
  return `$rt.$deref($self, ${_(name)})`;
}
exports.Deref = Deref;


// ---- Patterns
function PatternAny() {
  return `$rt.$pattern.$any`;
}
exports.PatternAny = PatternAny;


function PatternEqual(value) {
  return `$rt.$pattern.$equal(${value})`;
}
exports.PatternEqual = PatternEqual;


function PatternBind(id) {
  return `$rt.$pattern.$bind(${_(id)})`;
}
exports.PatternBind = PatternBind;


function PatternUnapply(expr, fields) {
  const pairs = fields.map(([k, p]) => `[${_(k)}, ${p}]`);
  return `$rt.$pattern.$unapply(${expr}, [${pairs.join(', ')}])`;
}
exports.PatternUnapply = PatternUnapply;


function PatternVector(patterns, spread) {
  return `$rt.$pattern.$vector([${patterns.join(', ')}], ${spread})`;
}
exports.PatternVector = PatternVector;


function PatternVectorSpread(pattern) {
  return `$rt.$pattern.$vector_spread(${pattern})`;
}
exports.PatternVectorSpread = PatternVectorSpread;


function FFI(path, id) {
  return `$self.put(${_(id)}, require(${(path)})($platform));`;
}
exports.FFI = FFI;


function Seq(a, b) {
  return `((${a}), (${b}))`;
}
exports.Seq = Seq;


function Assert(e, s) {
  return `$rt.$assert($self, ${e}, ${_(s)})`;
}
exports.Assert = Assert;


function Check(d, e) {
  return `$rt.$check($self, ${d}, () => { ${e} })`;
}
exports.Check = Check;