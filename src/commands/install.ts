import { setTimeout } from "timers/promises";

import {
  intro,
  outro,
  select,
  text,
  log,
  cancel,
  isCancel,
  confirm,
} from "@clack/prompts";
import chalk from "chalk";
import open from "open";
import { Arguments } from "yargs";
import { z } from "zod";

import packageJsonWizard from "../../package.json" assert { type: "json" };
import { WizardError } from "../error-classes.js";
import { run as runNextJsApp } from "../nextjs/nextjs-wizard.js";
import {
  createBugpilotConfig,
  safeGetBugpilotConfig,
} from "../utils/bugpilot-config.js";

type Args = {
  workspaceId?: string;
};

export async function install(argv: Arguments<Args>) {
  try {
    intro(
      `${chalk.bgCyanBright.bold(
        `Welcome to Bugpilot's installation wizard (v${packageJsonWizard.version})`,
      )}`,
    );

    const defaultWorkspaceId =
      argv.workspaceId || (await safeGetBugpilotConfig())?.workspaceId;

    const haveAccount = await confirm({
      message: "Do you have a Bugpilot account?",
      initialValue: defaultWorkspaceId ? true : false,
    });

    if (!haveAccount) {
      const url = "https://app.bugpilot.com/signup?via=cli";
      log.info(
        `Visit the Signup page to create a new Bugpilot Account: ${url}`,
      );
      await open(url);
    }

    const workspaceId = await text({
      message:
        "Enter your Bugpilot Workspace ID. Find it here: https://app.bugpilot.com/workspace/select?next=id",
      placeholder: "11111111-1111-1111-1111-111111111111",
      initialValue: defaultWorkspaceId,
      validate(value) {
        if (!z.string().uuid().safeParse(value).success) {
          return `Invalid Workspace ID (it should be an UUID). Get your Bugpilot Workspace ID from https://app.bugpilot.com/workspace/select?next=id.`;
        }
      },
    });

    if (isCancel(workspaceId)) {
      cancel("Cancelled.");
      process.exit(0);
    }

    const selectedFramework = await select({
      message: "Select your framework:",
      options: [
        {
          label: "Next.js with App router",
          value: "nextjs-app",
        },
        {
          label: "Other",
          value: "other",
        },
      ],
    });

    if (isCancel(selectedFramework)) {
      cancel("Cancelled.");
      process.exit(0);
    }

    if (selectedFramework === "other") {
      outro(
        chalk.redBright(
          "Sorry, we currently only support Next.js App Router. Please create an issue on GitHub if you want to see support for other frameworks: https://github.com/bugpilot/wizard/issues/new",
        ),
      );
      process.exit(1);
    }

    const productionBrowserSourceMaps = await confirm({
      message:
        "Do you want to enable browser source maps? " +
        chalk.gray(
          "Browser source maps improve error readability in production but have some drawbacks. Read more: https://nextjs.org/docs/app/api-reference/next-config-js/productionBrowserSourceMaps",
        ),
      initialValue: true,
    });

    if (isCancel(productionBrowserSourceMaps)) {
      cancel("Cancelled.");
      process.exit(0);
    }

    // all questions have been answered, let's create the config file:
    createBugpilotConfig({
      workspaceId,
      next: { productionBrowserSourceMaps },
    });

    await runWizardForFramework(selectedFramework as string);

    log.success(
      `${chalk.bgCyanBright.bold("What's next?")} Bugpilot will now start collecting errors from your production builds. Bugpilot does not catch errors during development. Your Dashboard is ready at: https://app.bugpilot.com/workspace/${workspaceId}/overview`,
    );

    outro(chalk.bold.green("Have an awesome day! Happy coding 🚀"));

    await setTimeout(3 * 1000);
    await open(
      `https://app.bugpilot.com/workspace/${workspaceId}/overview?via=cli-done`,
    );
  } catch (e) {
    if (e instanceof WizardError) {
      log.error(chalk.red(e.message));
      process.exit(1);
    }

    const err = e as Error;

    log.error(
      chalk.red(
        `Unexpected error: ${err.message}. Please report it on GitHub: https://github.com/bugpilot/wizard/issues/new`,
      ),
    );
    process.exit(2);
  }
}

function runWizardForFramework(framework: string) {
  switch (framework) {
    case "nextjs-app":
      return runNextJsApp();
    default:
      throw new Error("Invalid framework: " + framework);
  }
}
