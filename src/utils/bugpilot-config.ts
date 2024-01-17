import fs from "node:fs";
import path from "node:path";

type BugpilotConfig = {
  workspaceId: string;
  next?: Partial<{
    productionBrowserSourceMaps: boolean;
  }>;
};

const CONFIG_FILE_NAME = "bugpilot.config.js";
const configPath = path.join(process.cwd(), CONFIG_FILE_NAME);

export async function getBugpilotConfig(): Promise<BugpilotConfig> {
  const bugpilotConfig = (await import(configPath)) as {
    default: BugpilotConfig;
  };

  return bugpilotConfig.default;
}

export const safeGetBugpilotConfig = async () => {
  try {
    return await getBugpilotConfig();
  } catch (e) {
    return null;
  }
};

export function createBugpilotConfig(config: BugpilotConfig) {
  const bugpilotConfig = `module.exports = ${JSON.stringify(config, null, 2)}`;
  fs.writeFileSync(configPath, bugpilotConfig);
}
