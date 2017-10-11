const parser = require('./parser.ometajs').PurrParser;
const compiler = require('./compiler.ometajs').PurrCompiler;


module.exports = {
  core(code) {
    const ast = parser.matchAll(code, 'Program');
    
    return compiler.match(ast, 'compile');
  },

  kernel(code) {
    const ast = parser.matchAll(code, 'Privileged');
    
    return compiler.match(ast, 'compile');
  }
};