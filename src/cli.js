//---------------------------------------------------------------------
//
// This source file is part of the Canel.és project.
//
// See LICENCE for licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//---------------------------------------------------------------------

const doc = `canelés — A layered subset of ECMAScript 6

Usage:
  caneles run <file>
  caneles compile <file>
  caneles --version
  caneles --help

Options:
  --help          Shows this screen
  -v, --version   Shows the version of the compiler
`;

const fs = require('fs');
const path = require('path');
const babel = require('babel-core').transformFromAst;
const docopt = require('docopt').docopt;
const pkg = require('../package.json');
const runtime = require('../runtime/lib');
const { parse, compile, generate } = require('./language-framework');

const show = (x) => console.log(x);

function toJs(filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const root = path.dirname(filename);
  const { language, code } = parse(source, { requireRoot: root });
  const jsAst = compile(code, language);
  return babel(jsAst, {
    presets: ['es2015'],
    filename: filename
  }).code;
}

// YOLO ¯\_(ツ)_/¯
require.extensions['.es'] = function(module, filename) {
  module._compile(toJs(filename), filename);
};

module.exports = function Main() {
  const args = docopt(doc, { help: false });

    args['--help']    ?      show(doc)
  : args['--version'] ?      show(`Canelés version ${pkg.version}`)
  : args['compile']   ?      show(toJs(args['<file>']))
  : args['run']       ?      require(path.resolve(process.cwd(), args['<file>']))(runtime)
  : /* else */               show(doc);
};
