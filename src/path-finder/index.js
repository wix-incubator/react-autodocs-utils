/* global Promise */

const recastVisit = require('../parser/recast-visit');


const pathFinder = (source = '') =>
  new Promise((resolve) =>
    recastVisit(source)({
      visitExportDefaultDeclaration: function(path) {
        const componentPath = path.node.declaration.properties
          .find(({ key: { name } }) => name === 'componentPath');

        resolve(componentPath.value.value);
      }
    })
  );


module.exports = pathFinder;
