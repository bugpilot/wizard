#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { install } from "./commands/install.js";

await yargs(hideBin(process.argv))
  .command(
    "install",
    "Start the Bugpilot installation wizard",
    // @ts-expect-error yargs typings are wrong
    (_) => {
      return _.option("workspace-id", {
        type: "string",
        describe: "The ID of your Bugpilot Workspace",
        demandOption: false,
      }).option("install-deps", {
        type: "boolean",
        describe: "Installing required dependencies using pnpm, yarn, or npm",
        demandOption: false,
        default: true,
      });
    },
    install,
  )
  .command(
    "help",
    "Show help",
    () => {},
    () => {
      // @ts-expect-error yargs typings are wrong
      yargs.showHelp();
    },
  )
  .demandCommand()
  .parse();
