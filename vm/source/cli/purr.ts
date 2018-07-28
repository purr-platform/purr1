import * as yargs from "yargs";
import * as FS from "fs";
import * as Path from "path";
import { parse } from "../parse";
import { VM } from "../vm";
const argv = yargs.usage("purr <file> [--ast]").boolean("ast").argv;

const source = FS.readFileSync(argv._[0], "utf8");
const ast = parse(source);

if (argv.ast) {
  // TODO: implement ast serialisation
  console.log(ast);
} else {
  const vm = new VM(ast);
  console.log(vm.run("main", []));
}
