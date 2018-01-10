/* global Promise */

const recast = require('recast');
const babylon = require('babylon');
const builders = recast.types.builders;

const parser = source =>
  recast.parse(source, {
    parser: {
      parse: () => babylon.parse(source, {
        plugins: ['jsx', 'classProperties', 'objectRestSpread'],
        sourceType: 'module',
        allowImportExportEverywhere: true
      })
    }
  });

const metadataMerger = (source = '') => metadata =>
  new Promise((resolve, reject) => {
    const sourceAST = parser(source);
    const metadataAST = parser(`(${JSON.stringify(metadata)})`);

    let metadataProperties;

    recast.visit(metadataAST, {
      visitObjectExpression: function(path) {
        metadataProperties = path.node.properties;
        return false;
      }
    });

    if (!metadataProperties) {
      return reject('ERROR: Unable to merge metadata with source');
    }

    recast.visit(sourceAST, {
      visitExportDefaultDeclaration: function(path) {
        path.node.declaration.properties.push(
          builders.objectProperty(
            builders.identifier('_metadata'),
            builders.objectExpression(metadataProperties)
          )
        );

        return false;
      }
    });

    resolve(
      recast.prettyPrint(sourceAST, { tabWidth: 2, reuseWhitespace: true }).code
    );
  });


module.exports = metadataMerger;
