/* global Promise */

const recast = require('recast');

const parse = require('../parser/recast-parser');
const print = require('../parser/recast-printer');
const builders = recast.types.builders;

const metadataMerger = source => metadata =>
  new Promise((resolve, reject) =>
    source && metadata
      ? resolve(parse(source))
      : reject('ERROR: unable to merge `metadata` into exported story config, ensure `source` & `metadata` are defined')
  )

    .then(ast => {
      const metadataAST = parse(`(${JSON.stringify(metadata)})`);

      let metadataProperties;

      recast.visit(metadataAST, {
        visitObjectExpression: function(path) {
          metadataProperties = path.node.properties;
          return false;
        }
      });

      if (!metadataProperties) {
        return Promise.reject('ERROR: Unable to merge metadata with source');
      }

      recast.visit(ast, {
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

      return print(ast);
    });


module.exports = metadataMerger;
