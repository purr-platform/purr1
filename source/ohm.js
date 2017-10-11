const ohm = require('ohm-js');
var pexprs = require('ohm-js/src/pexprs');


const toAST = (grammar, result) => {
  const semantics = grammar.createSemantics().addOperation('toAST()', {
    _terminal() {
      return this.primitiveValue;
    },

    _nonterminal(children) {
      if (this.isLexical()) {
        return this.sourceString;
      } else {
        return [this.ctorName, ...children.map(x => x.toAST())];
      }
    },

    _iter(children) {
      if (this._node.isOptional()) {
        if (this.numChildren === 0) {
          return null;
        } else {
          return children[0].toAST();
        }
      }

      return children.map(x => x.toAST());
    },

    NonemptyListOf(first, sep, rest) {
      return [first.toAST(), ...rest.toAST()]
    },

    EmptyListOf() {
      return [];
    },

    ListOf(xs) {
      return xs.toAST();
    }
  });

  return semantics(result).toAST();
};


const _ = module.exports = {
  $project: (field) => {
    if (!_.hasOwnProperty(field)) {
      throw new Error(`No field ${field} in Ohm`);
    }
    return _[field];
  },

  grammar: (x) => ohm.grammar(x),
  parse: (grammar, source) => {
    const result = grammar.match(source);
    if (result.succeeded()) {
      return toAST(grammar, result);
    } else {
      throw new SyntaxError(result.message);
    }
  }
};