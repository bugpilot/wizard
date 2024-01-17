import { NodePath } from "@babel/core";
import * as t from "@babel/types";

export default function withBugpilotConfig() {
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
