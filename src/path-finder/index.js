/* global Promise */

const parse = require('../parser/parse');
const visit = require('../parser/visit');
const get = require('../get');

const getPropertyValue = path => propertyName =>
  get(path)('node.declaration.properties')
    .find(({ key: { name } }) => name === propertyName);

const pathFinder = (source = '') => {
  const ast = parse(source);

  return new Promise((resolve, reject) => {
    visit(ast)({
      ExportDefaultDeclaration(path) {
        const componentPath = get(getPropertyValue(path)('componentPath'))('value.value');

        if (componentPath) {
          resolve(componentPath);
          return false;
        } else {
          const componentReference = get(getPropertyValue(path)('component'))('value.name');

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
      },

      ExportNamedDeclaration(path) {
        const isNamedDefault =
          path.node.specifiers.some(({ exported }) => exported.name === 'default');

        if (isNamedDefault) {
          resolve(get(path)('node.source.value'));
        }
      }
    });

    reject(new Error('ERROR: Unable to resolve path to component'));
  });
};


module.exports = pathFinder;
