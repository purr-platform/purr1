import * as yargs from "yargs";
import * as FS from "fs";
import * as Path from "path";
import { parse, compile } from "../languages/purr";
import { VM } from "../vm";
import { World } from "../runtime";
const argv = yargs.usage("purr <directory> <module-id>").boolean("ast").argv;

function read(directory: string) {
  return (name: string) => {
    return FS.readFileSync(Path.join(directory, name), "utf8");
  };
}

const [directory, moduleId] = argv._;

const world = new World();
const files = FS.readdirSync(directory);
const modules = files
  .map(read(directory))
  .map(parse)
  .map(compile);

for (const module of modules) {
  module.attachTo(world);
}

const vm = new VM(world);
console.log(vm.run(moduleId, "main", []));
