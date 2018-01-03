/* global Promise */

const recast = require('recast');
const babylon = require('babylon');

const fileReader = require('../file-reader');
const reactDocgenParser = require('./react-docgen-parser');
const path = require('path');
const requireResolve = require('./require-resolve');

const recastParser = source =>
  recast.parse(source, {
    parser: {
      parse: () => babylon.parse(source, {
        plugins: ['jsx', 'classProperties', 'objectRestSpread'],
        sourceType: 'module'
      })
    }
  });

const handleComposedProps = (parsed, currentPath) =>
  Promise
    .all(parsed.composes.map(composedPath =>
      fileReader(
        requireResolve(path.join(process.cwd(), path.dirname(currentPath), composedPath))
      ))
    )

    .then(composedSources =>
      Promise.all(composedSources.map(reactDocgenParser))
    )

    .then(composedDefinitions =>
      composedDefinitions.reduce(
        (acc, definition) => ({
          ...definition.props,
          ...acc
        }),
        {}
      )
    )

    .then(composedProps =>
      ({
        ...parsed,
        props: { ...parsed.props, ...composedProps }
      })
    )

    .then(allProps => {
      // eslint-disable-next-line no-unused-vars
      const { composes, ...otherProps } = allProps;
      return otherProps;
    })

    .catch(e => console.log('ERROR: Unable to handle composed props', e));


const followExports = (source, currentPath) => {
  return new Promise(resolve => {
    let wantedPath = '';

    const visitExportDefault = (source, currentPath) => {
      wantedPath = '';

      recast.visit(
        recastParser(source),
        {
          visitExportNamedDeclaration: function(path) {
            const isSpecifierDefault =
              path.node.specifiers.some(({ exported }) => exported.name === 'default');

            if (isSpecifierDefault) {
              wantedPath = path.node.source.value;

              return false;
            }

            this.traverse(path);
          }
        }
      );

      if (wantedPath) {
        const resolvedPath = path.join(
          path.dirname(currentPath),
          wantedPath
        );

        fileReader(resolvedPath)
          .then(source => visitExportDefault(source, resolvedPath))
          .catch(e => console.log(`ERROR: unable to read ${resolvedPath}`, e));
      } else {
        resolve(source);
      }
    };

    visitExportDefault(source, currentPath);
  });
};

const parser = (source, {currentPath}) =>
  new Promise((resolve, reject) => {
    followExports(source, currentPath)
      .then(source => {
        const parsed = reactDocgenParser(source);

        return parsed.composes ?
          handleComposedProps(parsed, currentPath).then(resolve).catch(reject) :
          resolve(parsed);
      });
  });

module.exports = parser;
