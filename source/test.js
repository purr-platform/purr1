var ohm = require('./ohm');
var fs = require('fs');
var path = require('path');

var g = ohm.grammar(fs.readFileSync(path.join(__dirname, './purr/core/grammar.ohm'), 'utf8'));
var s = fs.readFileSync(path.join(__dirname, './purr/core/ast.purr'), 'utf8');
s = s.split(/\r\r|\n/).slice(1).join('\r\n');

module.exports = ohm.parse(g, s);