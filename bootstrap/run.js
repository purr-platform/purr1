const [dir, id] = process.argv.slice(2);

if (!id || !dir) {
  throw new Error(`Usage: run <dir> <id>`);
}

require('ometajs');
const compile = require('./purr-compiler');
const Module = require('module');

const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;

const { World, runtime } = require('./runtime');

const world = new World();
const rt = runtime(world);
const platform = { runtime: rt };

Module._extensions['.purr'] = function(module, filename) {
  const js = compile(filename);
  module._compile(js, filename);
};

function loadDir(dir) {
  const files = glob("**/*.purr", { cwd: dir, absolute: true });
  for (const file of files) {
    require(file)(platform);
  }
}

loadDir(path.join(__dirname, '../source/purr'));
loadDir(dir);
world.start();

world.find(id).atPublic('main');
