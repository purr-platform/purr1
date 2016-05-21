//---------------------------------------------------------------------
//
// This source file is part of the Canel.és project.
//
// See LICENCE for licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//---------------------------------------------------------------------

// --[ Dependencies ]--------------------------------------------------
const generateJs = require('babel-generator').default;
const compile    = require('./transform');
const parse      = require('./parser');
const ast        = require('./ast');


// --[ Exports ]-------------------------------------------------------
module.exports = {
  ast: ast,
  parse: parse,
  compile: compile,
  generate: generateJs
};
