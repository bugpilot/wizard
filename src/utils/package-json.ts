import fs from "node:fs";
import path from "node:path";

import { WizardError } from "../error-classes.js";
import { PackageJsonType } from "../types.js";

export function getPackageJson(dir: string) {
  const pkgJsonPath = path.join(dir, "package.json");

  if (fs.existsSync(pkgJsonPath) === false) {
    throw new WizardError(
      "Cannot find package.json. Please re-run this command from your project root directory.",
    );
  }

  const packageJson = fs.readFileSync(pkgJsonPath, "utf8");
  const packageJsonObj = JSON.parse(packageJson) as unknown as PackageJsonType;
  return packageJsonObj;
}

export function getDependencyVersion(
  packageJsonObj: PackageJsonType | null,
  dependency: string,
) {
  const version: string | null =
    (packageJsonObj?.dependencies?.[dependency] as string) ||
    (packageJsonObj?.devDependencies?.[dependency] as string) ||
    null;

  if (!version) {
    throw new WizardError(
      `${dependency} is a required (dev)dependency but it is not installed.`,
    );
  }

  return String(version);
}
