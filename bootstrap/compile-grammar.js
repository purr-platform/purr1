const parser = require('./grammar.ometajs').Grammar;


module.exports = function(code) {
  const ast = parser.matchAll(code, 'grammar');
  console.log(ast);
}