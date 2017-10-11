const [input] = process.argv.slice(2);

if (!input) {
  throw new Error(`Usage: node compile.js <input>`);
}

require('ometajs');
const fs = require('fs');
const compile = require('./purr-compiler');

const code = compile(input);
fs.writeFileSync(input + '.js', code, 'utf8');