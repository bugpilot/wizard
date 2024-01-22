import util from "node:util";

import { NodePath } from "@babel/core";
import * as t from "@babel/types";

const addRootTagFactory = (workpaceId: string) => () => {
  return {
    visitor: {
      Program(path: NodePath<t.Program>) {
        const importPlugin = t.importDeclaration(
          [
            t.importSpecifier(
              t.identifier("Bugpilot"),
              t.identifier("Bugpilot"),
            ),
          ],
          t.stringLiteral("@bugpilot/plugin-nextjs"),
        );

        path.node.body.unshift(importPlugin);
      },

      JSXElement(path: NodePath<t.JSXElement>) {
        if (!t.isJSXOpeningElement(path.node.openingElement)) {
          return;
        }

        if (
          !t.isJSXIdentifier(path.node.openingElement.name, {
            name: "body",
          })
        ) {
          return;
        }

        const bugpilotComponentNode = t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier("Bugpilot"),
            [
              t.jsxAttribute(
                t.jsxIdentifier("workspaceId"),
                t.stringLiteral(workpaceId),
              ),
            ],
            true,
          ),
          t.jsxClosingElement(t.jsxIdentifier("Bugpilot")),
          [],
          true,
        );

        if (!path.node.children) {
          throw new Error(
            `Expected path.node.children to be defined, got: ${util.inspect(
              path.node.children,
            )}`,
          );
        }
        path.node.children.push(bugpilotComponentNode);
        path.skip();
      },
    },
  };
};

export default addRootTagFactory;
