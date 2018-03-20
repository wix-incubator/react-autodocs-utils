/* global Promise */

const types = require('@babel/types');

const parse = require('../parser/parse');
const visit = require('../parser/visit');
const get = require('../get');

const extractKeyFromObject = objectExpression => key =>
  objectExpression.properties.find(({ key: { name } }) => name === key);

const pathFinder = (source = '') => {
  const ast = parse(source);

  return new Promise((resolve, reject) => {
    visit(ast)({
      ExportDefaultDeclaration(path) {
        const declaration = path.node.declaration;

        if (types.isObjectExpression(declaration)) {
          const componentPath = extractKeyFromObject(declaration)('componentPath');

          if (componentPath) {
            resolve(componentPath.value.value);
            return false;
          } else {
            const componentReference = extractKeyFromObject(declaration)('component').value.name;

            visit(ast)({
              ImportDeclaration(path) {
                const componentPath = get(path)('node.specifiers')
                  .find(({ local: { name } }) => name === componentReference);

                if (componentPath) {
                  resolve(get(path)('node.source.value'));
                  return false;
                }
              }
            });

            resolve(componentReference);
          }
        }

        if (types.isIdentifier(declaration)) {
          const binding = path.scope.bindings[declaration.name];

          if (binding) {
            visit(ast)({
              VariableDeclarator(path) {
                if (types.isIdentifier(binding.identifier, { name: binding.identifier.name })) {
                  const componentPath =
                    extractKeyFromObject(path.node.init)('componentPath').value.value;
                  resolve(componentPath);
                }
              }
            });
          }
        }
      }
    });

    reject(new Error('ERROR: Unable to resolve path to component'));
  });
};


module.exports = pathFinder;
