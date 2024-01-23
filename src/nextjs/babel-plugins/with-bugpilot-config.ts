import { NodePath, PluginObj, PluginOptions } from "@babel/core";
import * as t from "@babel/types";

type PluginOpts = PluginOptions & {
  configFilePath: string;
};

const withBugpilotConfigFactory =
  ({ configFilePath }: PluginOpts) =>
  (): PluginObj => {
    if (configFilePath.endsWith(".js") || configFilePath.endsWith(".cjs")) {
      return cjsPlugin();
    }

    return esmPlugin();
  };

export default withBugpilotConfigFactory;

function cjsPlugin(): PluginObj {
  return {
    visitor: {
      Program(path: NodePath<t.Program>) {
        // const { withBugpilot } = require('@bugpilot/plugin-nextjs')
        const requirePlugin = t.variableDeclaration("const", [
          t.variableDeclarator(
            t.objectPattern([
              t.objectProperty(
                t.identifier("withBugpilot"),
                t.identifier("withBugpilot"),
                false,
                true,
              ),
            ]),
            t.callExpression(t.identifier("require"), [
              t.stringLiteral("@bugpilot/plugin-nextjs"),
            ]),
          ),
        ]);

        path.node.body.unshift(requirePlugin);
      },

      ExpressionStatement(path: NodePath<t.ExpressionStatement>) {
        // Target an expression statement that contains an assignment for `module.exports`
        if (
          t.isAssignmentExpression(path.node.expression) &&
          t.isMemberExpression(path.node.expression.left) &&
          t.isIdentifier(path.node.expression.left.object, {
            name: "module",
          }) &&
          t.isIdentifier(path.node.expression.left.property, {
            name: "exports",
          })
        ) {
          // The right-hand side of the assignment is the code you want to wrap
          const rightHandSideExpression = path.node.expression.right;

          // Replace the `module.exports` assignment with wrapped code
          path.replaceWith(
            t.expressionStatement(
              t.assignmentExpression(
                "=",
                t.memberExpression(
                  t.identifier("module"),
                  t.identifier("exports"),
                ),
                t.callExpression(t.identifier("withBugpilot"), [
                  rightHandSideExpression,
                  t.callExpression(t.identifier("require"), [
                    t.stringLiteral("./bugpilot.config.js"),
                  ]),
                ]),
              ),
            ),
          );

          path.skip();
        }
      },
    },
  };
}

function esmPlugin() {
  return {
    visitor: {
      Program(path: NodePath<t.Program>) {
        // import { withBugpilot } from '@bugpilot/plugin-nextjs'
        const importPlugin = t.importDeclaration(
          [
            t.importSpecifier(
              t.identifier("withBugpilot"),
              t.identifier("withBugpilot"),
            ),
          ],
          t.stringLiteral("@bugpilot/plugin-nextjs"),
        );
        path.node.body.unshift(importPlugin);

        const importConfig = t.importDeclaration(
          [
            t.importSpecifier(
              t.identifier("bugpilotConfig"),
              t.identifier("default"),
            ),
          ],
          t.stringLiteral("./bugpilot.config.js"),
        );
        path.node.body.unshift(importConfig);
      },

      ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>) {
        if (
          t.isClassDeclaration(path.node.declaration) ||
          t.isTSDeclareFunction(path.node.declaration)
        ) {
          throw new Error(
            "Invalid export type from Next.js config file:" +
              path.node.declaration.type,
          );
        }

        if (t.isAssignmentExpression(path.node.declaration)) {
          // Very weird but still valid syntax:
          // export default nextConfig = {
          //   reactStrictMode: true,
          //   images: {
          //     domains: ["localhost"],
          //   },
          // };
          throw new Error(
            "Unsupported export syntax of type " +
              path.node.declaration.type +
              ". Do you really mean to export an assignment (" +
              path.node.declaration.left +
              " = ...)?",
          );
        }

        // Replace the default export with wrapped code
        path.replaceWith(
          t.exportDefaultDeclaration(
            t.callExpression(t.identifier("withBugpilot"), [
              t.toExpression(path.node.declaration),
              t.identifier("bugpilotConfig"),
            ]),
          ),
        );

        path.skip();
      },
    },
  };
}
