/* global Promise */

const types = require('@babel/types');
const visit = require('../parser/visit');
const parse = require('../parser/parse');
const print = require('../parser/print');


const buildImportDeclaration = (specifier, path) => types.importDeclaration(
  [ specifier ],
  types.stringLiteral(path)
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
        types.importSpecifier(types.identifier('storiesOf'), types.identifier('storiesOf')),
        '@storybook/react'
      ));

      ast.program.body.unshift(buildImportDeclaration(
        types.importDefaultSpecifier(types.identifier('storyNew')),
        'wix-storybook-utils/StoryNew'
      ));

      return ast;
    })

    .then(ast => {
      visit(ast)({
        ExportDefaultDeclaration(path) {
          const exportsObject = types.isObjectExpression(path.node.declaration);

          if (exportsObject) {
            const exportedObject = path.node.declaration;

            // add `_config` to exported object
            const configAST = parse(`(${JSON.stringify(storyConfig)})`);
            let configProperties;

            visit(configAST)({
              ObjectExpression(path) {
                const storiesOfProperty = types.objectProperty(
                  types.identifier('storiesOf'),
                  types.identifier('storiesOf')
                );

                path.node.properties.push(storiesOfProperty);

                configProperties = path.node.properties;
                return false;
              }
            });

            exportedObject.properties.push(
              types.objectProperty(
                types.identifier('_config'),
                types.objectExpression(configProperties)
              )
            );

            // wrap exported object with `storyNew()`
            path.node.declaration = types.callExpression(
              types.identifier('storyNew'),
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
