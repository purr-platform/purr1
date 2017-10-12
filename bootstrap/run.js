const argv = require('optimist')
  .usage('Usage: $0 [--root <dir>] (--run <id> | --test [id])')
  .argv;

  console.log(argv);
  process.exit(1);

if (typeof argv.run !== 'string' || !argv.test) {
  throw new Error(`Needs to provide a test or run option`);
}

const root = argv.root || process.cwd();

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

if (argv.run) {
  world.find(argv.run).atPublic('main');
} else if (argv.test) {
  let failures = [];
  let tests = 0;
  const doTest = (m) => typeof argv.test === 'string' ? m.id === argv.test : true;
  for (const m of world.modules.entries()) {
    if (doTest(m)) {
      for (const [k, v] of Object.entries(m.scope.bindings)) {
        if (v.$tests) {
          v.$tests.forEach(f => {
            ++tests;
            try {
              f();
            } catch (e) {
              console.error(`${k}: ${e.message}`);
              failures.push(e);
            }
          });
        }
      }
    }
  }
  console.log('---');
  console.log(`Tests:  ${tests}`);
  console.log(`Passed: ${tests - failures.length}`);
  console.log(`Failed: ${failures.length}`);

  if (failures.length > 0) {
    process.exit(1);
  }
} else {
  throw new Error(`No action`);
}
