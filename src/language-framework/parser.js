//---------------------------------------------------------------------
//
// This source file is part of the Canel.és project.
//
// See LICENCE for licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//---------------------------------------------------------------------

// --[ Dependencies ]--------------------------------------------------
const ast     = require('./ast');
const path    = require('path');
const resolve = require('resolve');


// --[ Constants ]-----------------------------------------------------
const languageRegexp = /^\s*#language\s*([\.\-\/\w\d]+);\s*([\s\S]*)$/;


// --[ Parsing ]-------------------------------------------------------
function parse(source, options) {
  const [_, language, contents] = source.match(languageRegexp || '');
  const root = options.requireRoot;
  if (!root) {
    throw new Error('No requireRoot provided');
  }
  if (language) {
    const parser = require(resolve.sync(language, { basedir: options.requireRoot }));
    return parser(ast).parse(contents);
  } else {
    throw new SyntaxError(`No language provided ${options.filename ? `for ${options.filename}` : ''}`);
  }
}


// --[ Exports ]-------------------------------------------------------
module.exports = parse;
