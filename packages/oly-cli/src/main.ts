import { commands } from "./commands";
import { ensureDependencies } from "./dependencies";

const actionName = process.argv[2];
const args = process.argv.slice(3);
const target = commands[actionName] || commands.help;
const action = target.alias ? commands[target.alias] : target;

ensureDependencies(action.ensure);

if (action.exec) {
  action.exec(args);
}
