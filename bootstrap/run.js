const argv = require('optimist')
  .usage('Usage: $0 [--root <dir>] (--run <id> | --test [id])')
  .argv;

if ((typeof argv.run !== 'string') && !argv.test) {
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

const loadSet = new Set();

function loadDir(dir, pattern) {
  const files = glob(pattern, { cwd: dir, absolute: true });
  for (const file of files) {
    if (!loadSet.has(file)) {
      require(file)(platform);
      loadSet.add(file);
    }
  }
}

function indent(s) {
  return s.split(/\r\n|\r|\n/).map(x => `  | ${x}`).join('\n');
}

loadDir(path.join(__dirname, '../source/purr'), '**/*.purr');
loadDir(root, '**/*.purr');
world.start();

if (argv.run) {
  world.find(argv.run).atPublic('main');
} else if (argv.test) {
  let failures = [];
  let tests = 0;
  const doTest = (m) => typeof argv.test === 'string' ? m.id === argv.test : true;
  for (const m of world.modules.values()) {
    if (doTest(m)) {
      console.log(`\nRunning tests for ${m.id}`);
      console.log('='.repeat(18 + m.id.length));
      for (const [k, v] of Object.entries(m.scope.bindings)) {
        if (v.$tests) {
          console.log(`• ${k} (${v.$tests.length} tests)`);
          v.$tests.forEach(f => {
            ++tests;
            try {
              f();
            } catch (e) {
              console.error(`${indent(e.message)}\n`);
              failures.push(e);
            }
          });
        }
      }
    }
  }
  console.log('');
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
