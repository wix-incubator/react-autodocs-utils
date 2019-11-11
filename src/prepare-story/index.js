/* global Promise */

const types = require('@babel/types');
const visit = require('../parser/visit');
const parse = require('../parser/parse');
const print = require('../parser/print');
const get = require('../get');

const buildImportDeclaration = (specifier, path) => types.importDeclaration([specifier], types.stringLiteral(path));

const isModuleExports = path =>
  [
    types.isMemberExpression(path.node.expression.left),
    get(path)('node.expression.left.object.name') === 'module',
    get(path)('node.expression.left.property.name') === 'exports',
  ].every(Boolean);

const prepareStory = storyConfig => source =>
  new Promise((resolve, reject) =>
    source && !!storyConfig
      ? resolve(source)
      : reject('ERROR: unable to prepare story, both `storyConfig` and `source` must be provided')
  )

    .then(parse)

    .then(ast => {
      let isES5 = true;

      visit(ast)({
        ExportDefaultDeclaration() {
          isES5 = false;
          return false;
        },
      });

      if (isES5) {
        // add requires
        const storyId = types.identifier('story');
        const storiesOfId = types.identifier('storiesOf');
        const requireId = types.identifier('require');
        const wsuImportPath = types.stringLiteral('wix-storybook-utils/Story');
        const storiesOfImportPath = types.stringLiteral('@storybook/react');

        // const { storiesOf } = require("@storybook/react");
        ast.program.body.unshift(
          types.variableDeclaration('const', [
            types.variableDeclarator(
              types.objectPattern([
                types.objectProperty(storiesOfId, storiesOfId, /*computed*/ false, /*shorthand*/ true),
              ]),
              types.callExpression(requireId, [storiesOfImportPath])
            ),
          ])
        );

        // const story = require('wix-storybook-utils/Story')
        ast.program.body.unshift(
          types.variableDeclaration('const', [
            types.variableDeclarator(storyId, types.callExpression(requireId, [wsuImportPath])),
          ])
        );
      } else {
        // add necessary imports
        ast.program.body.unshift(
          buildImportDeclaration(
            types.importSpecifier(types.identifier('storiesOf'), types.identifier('storiesOf')),
            '@storybook/react'
          )
        );

        ast.program.body.unshift(
          buildImportDeclaration(types.importDefaultSpecifier(types.identifier('story')), 'wix-storybook-utils/Story')
        );
      }

      return ast;
    })

    .then(ast => {
      // TODO: this is not too good, unfortunatelly, i cant return
      // rejected promise from within visitor, babylon complains
      let error = null;

      const configAST = parse(`(${JSON.stringify(storyConfig)})`);
      let configProperties;

      visit(configAST)({
        ObjectExpression(path) {
          const storiesOfProperty = types.objectProperty(types.identifier('storiesOf'), types.identifier('storiesOf'));

          path.node.properties.push(storiesOfProperty);

          configProperties = path.node.properties;
          path.stop();
        },
      });

      const handleExportObject = (path, node) => {
        const exportsObject = types.isObjectExpression(node);
        const exportsIdentifier = types.isIdentifier(node);

        if (exportsIdentifier) {
          const referenceName = node.name;
          const configObject = path.scope.bindings[referenceName].path.node.init;

          if (!configObject.properties) {
            error = `ERROR: storybook config must export an object, exporting ${configObject.type} instead`;
            return false;
          }

          configObject.properties.push(
            types.objectProperty(types.identifier('_config'), types.objectExpression(configProperties))
          );

          return types.callExpression(types.identifier('story'), [node]);
        }

        if (exportsObject) {
          node.properties.push(
            types.objectProperty(types.identifier('_config'), types.objectExpression(configProperties))
          );

          // wrap exported object with `story()`
          return types.callExpression(types.identifier('story'), [node]);
        }
      };

      visit(ast)({
        ExportDefaultDeclaration(path) {
          path.node.declaration = handleExportObject(path, path.node.declaration);
          return false;
        },

        ExpressionStatement(path) {
          if (isModuleExports(path)) {
            path.node.expression.right = handleExportObject(path, path.node.expression.right);
          }
        },
      });

      return error ? Promise.reject(error) : ast;
    })

    .then(print);

module.exports = prepareStory;
