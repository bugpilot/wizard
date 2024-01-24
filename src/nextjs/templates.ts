export const RootErrorPageTemplate = `// Generated by Bugpilot Wizard
"use client";

import { captureError } from "@bugpilot/plugin-nextjs";

import "@bugpilot/react-error-pages/dist/index.css";
import { BasicErrorPage } from "@bugpilot/react-error-pages";

// Global errors are rendered when an error is thrown outside of a page,
// or on the root layout. Unfortunately, there is currently no way to avoid rendering
// the global error page in development mode. The actual error is logged to the
// browser console.

function ErrorPage({
  error,
  reset,
}: React.PropsWithChildren<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const handleReportError = (error: Error) => {
    captureError(error, {
      kind: "error-page",
    });
  };

  // Global Error also catch root layout errors
  // so we need to render the html and body tags here
  return (
    <BasicErrorPage
      error={error}
      reset={reset}
      reportErrorFn={handleReportError}
    />
  );
}

export default process.env.NODE_ENV === "production"
  ? ErrorPage
  : undefined;
`;

export const getGlobalErrorPageTemplate = (
  workspaceId: string,
) => `// Generated by Bugpilot Wizard
"use client";

import { Bugpilot, captureError } from "@bugpilot/plugin-nextjs";

import "@bugpilot/react-error-pages/dist/index.css";
import { BasicErrorPage } from "@bugpilot/react-error-pages";

// Global errors are rendered when an error is thrown outside of a page,
// or on the root layout. Unfortunately, there is currently no way to avoid rendering
// the global error page in development mode. The actual error is logged to the
// browser console.

export default function GlobalErrorPage({
  error,
  reset,
}: React.PropsWithChildren<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const handleReportError = (error: Error) => {
    captureError(error, {
      kind: "global-error-page",
    });
  };

  // Global Error also catch root layout errors
  // so we need to render the html and body tags here
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>Application Error</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          height: "100vh",
          width: "100vw",
          fontFamily: "sans-serif",
        }}
      >
        <BasicErrorPage
          error={error}
          reset={reset}
          reportErrorFn={handleReportError}
        />

        <Bugpilot workspaceId="${workspaceId}" />
      </body>
    </html>
  );
}
`;

export const InstallBugpilotCommand = {
  npm: "npm install --save @bugpilot/plugin-nextjs@latest @bugpilot/react-error-pages@latest",
  yarn: "yarn add @bugpilot/plugin-nextjs@latest @bugpilot/react-error-pages@latest",
  pnpm: "pnpm add @bugpilot/plugin-nextjs@latest @bugpilot/react-error-pages@latest",
};
