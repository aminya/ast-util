#!/usr/bin/env node

const recast = require('recast');
const util = require('../lib');
const { types } = util;
const n = types.namedTypes;
const b = types.builders;
const assert = require('assert');

/**
 * Treats calls to `swap` as a macro to swap the identifiers passed to swap.
 *
 *   swap(left, right);
 *
 * Becomes
 *
 *   var tmp;
 *   tmp = left;
 *   left = right;
 *   right = tmp;
 *
 * @param {ast-types.Node} ast
 * @return {ast-types.Node} Returns `ast`.
 */
function transform(ast) {
  const replaced = [];

  types.traverse(ast, function(node) {
    if (n.ExpressionStatement.check(node)) {
      if (isSwapCall(this.get('expression'))) {
        // swap(left, right)
        const { expression } = node;
        assert.equal(expression.arguments.length, 2, `expected 2 arguments to \`swap\`, got ${expression.arguments.length}`);

        const left = expression.arguments[0];
        const right = expression.arguments[1];

        assert.ok(
          n.Identifier.check(left) || n.MemberExpression.check(left),
          `expected first argument of \`swap\` to be an Identifier or MemberExpression, found ${left.type}`
        );
        assert.ok(
          n.Identifier.check(right) || n.MemberExpression.check(right),
          `expected second argument of \`swap\` to be an Identifier or MemberExpression, found ${right.type}`
        );

        const tmp = util.uniqueIdentifier(this.scope);

        replaced.push(expression);
        this.replace(
          // var tmp = left;
          b.variableDeclaration(
            'var',
            [b.variableDeclarator(tmp, left)]
          ),
          // left = right
          b.expressionStatement(b.assignmentExpression(
            '=',
            left,
            right
          )),
          // right = tmp
          b.expressionStatement(b.assignmentExpression(
            '=',
            right,
            tmp
          ))
        );
      }
    } else if (isSwapCall(this) && replaced.indexOf(node) < 0) {
      throw new Error('unexpected `swap` macro used as an expression instead of a statement');
    }
  });

  return ast;
}

function isSwapCall(path) {
  return n.CallExpression.check(path.value) && util.isReference(path.get('callee'), 'swap');
}

function readStdin(callback) {
  let stdin = '';

  process.stdin.setEncoding('utf8');

  process.stdin.on('readable', function() {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      stdin += chunk;
    }
  });

  process.stdin.on('end', function() {
    callback(stdin);
  });
}

readStdin(function(stdin) {
  process.stdout.write(recast.print(transform(recast.parse(stdin))).code);
});
