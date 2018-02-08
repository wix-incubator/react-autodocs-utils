/* global Promise */

const recastVisit = require('../parser/recast-visit');
const get = require('../get');

const getPropertyValue = path => propertyName =>
  get(path)('node.declaration.properties')
    .find(({ key: { name } }) => name === propertyName);

const pathFinder = (source = '') => {
  const visit = recastVisit(source);

  return new Promise((resolve, reject) => {
    visit({
      visitExportDefaultDeclaration: function(path) {
        const componentPath = get(getPropertyValue(path)('componentPath'))('value.value');

        if (componentPath) {
          resolve(componentPath);
          return false;
        } else {
          const componentReference = get(getPropertyValue(path)('component'))('value.name');

          visit({
            visitImportDeclaration: function(path) {
              const componentPath = get(path)('node.specifiers')
                .find(({ local: { name } }) => name === componentReference);

              if (componentPath) {
                resolve(get(path)('node.source.value'));
                return false;
              }

              this.traverse(path);
            }
          });

          resolve(componentReference);
        }
      }
    });

    reject(new Error('ERROR: Unable to resolve path to component'));
  });
};


module.exports = pathFinder;
