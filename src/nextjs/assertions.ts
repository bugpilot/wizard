import fs from "node:fs";
import path from "node:path";

import { gte, minVersion } from "semver";

import { WizardError } from "../error-classes.js";
import { getDependencyVersion, getPackageJson } from "../utils/package-json.js";

const cwd = process.cwd();

export function ensureNextJsVersion() {
  const packageJsonObj = getPackageJson(cwd);
  const nextVersion = getDependencyVersion(packageJsonObj, "next");

  if (!nextVersion) {
    throw new WizardError(
      "Bugpilot requires Next.js to be installed in your project.",
    );
  }

  const minNextVersion = minVersion(nextVersion);

  if (!minNextVersion) {
    throw new WizardError(
      `Bugpilot requires Next.js version to be a valid semver version. Found: ${nextVersion}`,
    );
  }

  if (!gte(minNextVersion, "14.0.0")) {
    throw new WizardError(
      "Bugpilot requires Next.js version 14.0.0 or greater.",
    );
  }
}

export function ensureNextJsConfig() {
  const nextConfigPath = path.join(cwd, "next.config.js");

  if (!fs.existsSync(nextConfigPath)) {
    throw new WizardError(
      `next.config.js not found at ${nextConfigPath}. Please run this command from your project root directory.`,
    );
  }
}
