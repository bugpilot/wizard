import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { transformSync } from "@babel/core";
import { log } from "@clack/prompts";
import chalk from "chalk";

import { WizardError } from "../error-classes.js";

import { ensureNextJsVersion, ensureNextJsConfig } from "./assertions.js";
import withBugpilotConfig from "./babel-plugins/with-bugpilot-config.js";
import {
  GlobalErrorPageTemplate,
  InstallBugpilotCommand,
  RootErrorPageTemplate,
} from "./templates.js";

export async function run() {
  const rootDir = process.cwd();
  log.info("Running from directory: " + rootDir);

  log.step("Checking prerequisites...");
  ensureNextJsConfig();
  ensureNextJsVersion();
  const appFolder = getAppFolder(rootDir);

  log.step("Updating next.config.js...");
  injectConfig(rootDir);

  log.step("Creating /app/error.tsx...");
  createErrorTsx(appFolder);

  log.step("Creating /app/global-error.tsx...");
  createGlobalErrorTs(appFolder);

  log.step("Installing @bugpilot/plugin-nextjs...");
  installDependencies(rootDir);

  log.success(
    "Next.js App Router wizard completed. It's a good idea to commit your changes now.",
  );
}

function getAppFolder(rootDir: string) {
  const appRouterPath = join(rootDir, "app");
  if (existsSync(appRouterPath)) {
    return appRouterPath;
  }

  const srcAppRouterPath = join(rootDir, "src", "app");
  if (existsSync(srcAppRouterPath)) {
    return srcAppRouterPath;
  }

  throw new WizardError(
    `Could not find /app or /src/app directory. Please run this command from your project root directory.`,
  );
}

function installDependencies(rootDir: string) {
  let packageManager: keyof typeof InstallBugpilotCommand = "npm";

  if (existsSync(join(rootDir, "yarn.lock"))) {
    packageManager = "yarn";
  } else if (existsSync(join(rootDir, "pnpm-lock.yaml"))) {
    packageManager = "pnpm";
  }

  const cmd = InstallBugpilotCommand[packageManager];

  log.info(`Running command: ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: rootDir });
}

function injectConfig(rootDir: string) {
  const nextConfigPath = join(rootDir, "next.config.js");
  const originalCode = readFileSync(nextConfigPath, "utf8");

  const result = transformSync(originalCode, {
    plugins: [withBugpilotConfig],
  });

  if (!result) {
    throw new Error(
      "Failed to update next.config.js (babel transform error). Please open an issue at https://github.com/bugpilot/wizard/issues/new.",
    );
  }

  const injectedCode = result.code;

  if (!injectedCode) {
    throw new Error(
      "Failed to update next.config.js (empty babel result code). Please open an issue at https://github.com/bugpilot/wizard/issues/new.",
    );
  }

  writeFileSync(nextConfigPath, injectedCode);
}

function createErrorTsx(appFolder: string) {
  const filePath = join(appFolder, "error.tsx");

  if (existsSync(filePath)) {
    log.warn(
      chalk.bgYellowBright.blackBright("⚠️  Warning:") +
        ` It seems like you already have a root error.tsx page. Learn how to update your error.tsx to work with Bugpilot: https://github.com/bugpilot/wizard/wiki/Manual-Setup-(Next.js-App-Router)`,
    );
    return;
  }

  writeFileSync(filePath, RootErrorPageTemplate);
}

function createGlobalErrorTs(appRouterPath: string) {
  const filePath = join(appRouterPath, "global-error.tsx");

  if (existsSync(filePath)) {
    log.warn(
      chalk.bgYellowBright.blackBright("⚠️  Warning:") +
        ` It seems like you already have a global-error.tsx page. Learn how to update your global-error.tsx to work with Bugpilot: https://github.com/bugpilot/wizard/wiki/Manual-Setup-(Next.js-App-Router)`,
    );
    return;
  }

  writeFileSync(filePath, GlobalErrorPageTemplate);
}
