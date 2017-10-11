const fs = require('fs');
const path = require('path');
const ohm = require('ohm-js');
const contents = fs.readFileSync(path.join(__dirname, '../compiler/ast.purr'));
const grammar = fs.readFileSync(path.join(__dirname, 'core-grammar.ohm'));

const coreGrammar = ohm.grammar(grammar);
console.log(Object.keys(coreGrammar.rules));