/* global Promise */

const recast = require('recast');
const babylon = require('babylon');

const fileReader = require('../file-reader');
const reactDocgenParser = require('./react-docgen-parser');
const path = require('path');

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
    .all(
      parsed.composes.map(composedPath => {
        const readablePath = path.join(path.dirname(currentPath), composedPath);

        return fileReader(readablePath)
          .then(source => [source, readablePath]);
      })
    )

    .then(composedSourcesAndPaths =>
      Promise.all(
        composedSourcesAndPaths.map(([source, path]) =>
          followExports(source, path)
        )
      )
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


// followExports (source: string, currentPath: string) => Promise<Source: string>
const followExports = (source, currentPath) => {
  return new Promise(resolve => {
    let exportedPath = '';

    const visitExportDefault = (source, currentPath) => {
      exportedPath = '';

      recast.visit(
        recastParser(source),
        {
          visitExportNamedDeclaration: function(path) {
            const isSpecifierDefault =
              path.node.specifiers.some(({ exported }) => exported.name === 'default');

            if (isSpecifierDefault) {
              exportedPath = path.node.source.value;

              return false;
            }

            this.traverse(path);
          }
        }
      );

      if (exportedPath) {
        const resolvedPath = path.join(
          path.extname(currentPath)
            ? path.dirname(currentPath)
            : currentPath,
          exportedPath
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
