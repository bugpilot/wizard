export type PackageJsonType = Partial<{
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}>;
