export const RootErrorPageTemplate = `// Generated by Bugpilot Wizard
"use client";

import { BugpilotErrorPage } from "@bugpilot/plugin-nextjs";
export default BugpilotErrorPage;
`;

export const GlobalErrorPageTemplate = `// Generated by Bugpilot Wizard
"use client";

import { BugpilotGlobalErrorPage } from "@bugpilot/plugin-nextjs";
export default BugpilotGlobalErrorPage;
`;

export const InstallBugpilotCommand = {
  npm: "npm install --save @bugpilot/plugin-nextjs",
  yarn: "yarn add @bugpilot/plugin-nextjs",
  pnpm: "pnpm add @bugpilot/plugin-nextjs",
};
