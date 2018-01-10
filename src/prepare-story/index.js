/* global Promise */

const recast = require('recast');

const parse = require('../parser/recast-parser');
const print = require('../parser/recast-printer');
const builders = recast.types.builders;
const namedTypes = recast.types.namedTypes;


const importDeclaration = builders.importDeclaration(
  [
    builders.importDefaultSpecifier(builders.identifier('story'))
  ],
  builders.literal('wix-storybook-utils/Story'),
  'value'
);

const prepareStory = storyConfig => source =>
  new Promise((resolve, reject) =>
    source && !!storyConfig
      ? resolve(source)
      : reject('ERROR: unable to prepare story, both `storyConfig` and `source` must be provided')
  )

    .then(parse)

    .then(ast => {
      ast.program.body.unshift(importDeclaration);
      return ast;
    })

    .then(ast => {
      recast.visit(ast, {
        visitExportDefaultDeclaration: function(path) {
          const exportsObject = path.node.declaration.type === namedTypes.ObjectExpression.name;

          if (exportsObject) {
            const exportedObject = path.node.declaration;

            // add `_config` to exported object
            const configAST = parse(`(${JSON.stringify(storyConfig)})`);
            let configProperties;

            recast.visit(configAST, {
              visitObjectExpression: path => {
                configProperties = path.node.properties;
                return false;
              }
            });

            exportedObject.properties.push(
              builders.objectProperty(
                builders.identifier('_config'),
                builders.objectExpression(configProperties)
              )
            );

            // wrap exported object with `story()`
            path.node.declaration = builders.callExpression(
              builders.identifier('story'),
              [ exportedObject ]
            );
          }

          return false;
        }
      });

      return ast;
    })

    .then(print);


module.exports = prepareStory;
