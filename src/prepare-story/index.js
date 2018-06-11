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
        types.importDefaultSpecifier(types.identifier('story')),
        'wix-storybook-utils/Story'
      ));

      return ast;
    })

    .then(ast => {
      // TODO: this is not too good, unfortunatelly, i cant return
      // rejected promise from within visitor, babylon complains
      let error = null;

      visit(ast)({
        ExportDefaultDeclaration(path) {
          const exportsObject = types.isObjectExpression(path.node.declaration);
          const exportsReference = types.isIdentifier(path.node.declaration);

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

          if (exportsReference) {
            const referenceName = path.node.declaration.name;
            const configObject = path.scope.bindings[referenceName].path.node.init;

            if (!configObject.properties) {
              error = `ERROR: storybook config must export an object, exporting ${configObject.type} instead`;
              return false;
            }

            configObject.properties.push(
              types.objectProperty(
                types.identifier('_config'),
                types.objectExpression(configProperties)
              )
            );

            path.node.declaration = types.callExpression(
              types.identifier('story'),
              [ path.node.declaration ]
            );
          }


          if (exportsObject) {
            const configObject = path.node.declaration;

            configObject.properties.push(
              types.objectProperty(
                types.identifier('_config'),
                types.objectExpression(configProperties)
              )
            );

            // wrap exported object with `story()`
            path.node.declaration = types.callExpression(
              types.identifier('story'),
              [ configObject ]
            );
          }

          return false;
        }
      });

      return error ? Promise.reject(error) : ast;
    })

    .then(print);


module.exports = prepareStory;
