#language ../../languages/caneles

module(core) {
  import "./grammar" exposing (ast, parse);

  let sql = union {
    Id(name),
    All,
    Values(items),
    Fields(items),
    Select(table, fields),
    Insert(table, values),
    View(name, query),
    Module(views)
  };

  let compile = (node) => switch node {
    case .ast.Identifier(_, _, let x):
      return sql.Id(x["name"].unwrap!());

    case .ast.WildcardName(_, _, _):
      return sql.All();

    case .ast.Values(_, _, let x):
      let head = x["head"].unwrap!();
      let tail = x["tail"].unwrap!();
      return sql.Values([
        compile(head),
        ...tail.map(x => compile(x))
      ]);

    case .ast.Fields(_, _, let x):
      let head = x["head"].unwrap!();
      let tail = x["tail"].unwrap!();
      return sql.Fields([
        compile(head),
        ...tail.map(x => compile(x))
      ]);

    case .ast.Insert(_, _, let x):
      let table = x["table"].unwrap!();
      let values = x["values"].unwrap!();
      return sql.Insert(compile(table), compile(values));

    case .ast.Select(_, _, let x):
      let table = x["table"].unwrap!();
      let fields = x["fields"].unwrap!();
      return sql.Select(compile(table), compile(fields));

    case .ast.View(_, _, let x):
      let name = x["name"].unwrap!();
      let query = x["query"].unwrap!();
      return sql.View(compile(name), compile(query));

    case .ast.Views(_, _, let x):
      let head = x["head"].unwrap!();
      let tail = x["tail"].unwrap!();
      return sql.Module([
        compile(head),
        ...tail.map(x => compile(x))
      ]);
  }
}