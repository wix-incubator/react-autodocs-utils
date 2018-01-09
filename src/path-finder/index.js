/* global Promise */

const recastVisitor = require('../parser/recast-visitor');


const pathFinder = (source = '') =>
  new Promise((resolve) =>
    recastVisitor(source)({
      visitExportDefaultDeclaration: function(path) {
        const componentPath = path.node.declaration.properties
          .find(({ key: { name } }) => name === 'componentPath');

        resolve(componentPath.value.value);
      }
    })
  );


module.exports = pathFinder;
