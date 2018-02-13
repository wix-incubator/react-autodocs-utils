/* global Promise */

const recast = require('recast');

const parse = require('../parser/recast-parse');
const visit = require('../parser/recast-visit');
const print = require('../parser/recast-print');
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

      visit(metadataAST)({
        ObjectExpression(path) {
          metadataProperties = path.node.properties;
        }
      });

      if (!metadataProperties) {
        return Promise.reject('ERROR: Unable to merge metadata with source');
      }

      visit(ast)({
        ExportDefaultDeclaration(path) {
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
