/* global Promise */

const recast = require('recast');

const parse = require('../parser/recast-parse');
const print = require('../parser/recast-print');
const builders = recast.types.builders;
const namedTypes = recast.types.namedTypes;


const buildImportDeclaration = (specifier, path) => builders.importDeclaration(
  [ specifier ],
  builders.literal(path),
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
      ast.program.body.unshift(buildImportDeclaration(
        builders.importSpecifier(builders.identifier('storiesOf')),
        '@storybook/react'
      ));

      ast.program.body.unshift(buildImportDeclaration(
        builders.importDefaultSpecifier(builders.identifier('storyNew')),
        'wix-storybook-utils/StoryNew'
      ));

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
                const storiesOfProperty = builders.objectProperty(
                  builders.identifier('storiesOf'),
                  builders.identifier('storiesOf')
                );

                path.node.properties.push(storiesOfProperty);

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

            // wrap exported object with `storyNew()`
            path.node.declaration = builders.callExpression(
              builders.identifier('storyNew'),
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
