require('ometajs');
const fs = require('fs');
const grammarCompiler = require('./compile-grammar');
const { core: coreCompiler, kernel: kernelCompiler } = require('./compile-core');

const modules = {
  'purr.grammar': grammarCompiler,
  'purr.core': coreCompiler,
  'purr.core.kernel': kernelCompiler
};

function parseHeading(file, code) {
  const match = code.match(/^language +([\w\d_\.]+)$/m);
  if (match == null) {
    throw new Error(`Invalid heading in ${file}: ${code.split(/\r\n|\r|\n/)[0]}`);
  } else {
    const lines = code.split(/\r\n|\r|\n/);
    return { language: match[1], code: lines.slice(1).join('\n') };
  }
}

module.exports = function(file) {
  const code = fs.readFileSync(file, 'utf8');
  const { language, code: cleanCode } = parseHeading(file, code);
  if (language in modules) {
    const compiler = modules[language];
    return compiler(cleanCode);
  } else {
    throw new Error(`No compiler defined for language ${language}`);
  }
}