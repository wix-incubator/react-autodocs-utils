/* global Promise */

const fileReader = require('../fs/read-file');
const reactDocgenParser = require('./react-docgen-parser');
const recastVisitor = require('./recast-visitor');
const path = require('path');

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
        composedSourcesAndPaths.map(([source, path]) => followExports(source, path))
      )
    )

    .then(composedSourcesAndPaths =>
      Promise.all(composedSourcesAndPaths.map(({source}) => reactDocgenParser(source)))
    )

    .then(parsedComponents => {
      // here we receive list of object containing parsed component
      // props. some of them may contain composed props from other
      // components, in which case we handleComposedProps again
      // recursively

      const withComposed = parsedComponents
        .filter(parsed => parsed.composes)
        .map(parsed => handleComposedProps(parsed, currentPath));

      const withoutComposed = parsedComponents
        .filter(parsed => !parsed.composes)
        .map(parsed => Promise.resolve(parsed));

      return Promise.all([
        Promise.all(withComposed),
        Promise.all(withoutComposed)
      ])
        .then(([ withComposed, withoutComposed ]) =>
          [...withComposed, ...withoutComposed]
        );
    })

    .then(parsedComponents =>
      parsedComponents.reduce(
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


// followExports (source: string, currentPath: string) => Promise<{source: String, exportPath: String}>
const followExports = (source, currentPath) =>
  new Promise(resolve => {
    let exportedPath = '';

    const visitExportDefault = (source, currentPath) => {
      exportedPath = '';

      recastVisitor(source)({
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
        resolve({ source, exportPath: exportedPath || currentPath });
      }
    };

    visitExportDefault(source, currentPath);
  });


const parser = (source, {currentPath}) =>
  new Promise((resolve, reject) => {
    followExports(source, currentPath)
      .then(({source, exportPath}) => {
        const parsed = reactDocgenParser(source);

        return parsed.composes
          ? handleComposedProps(parsed, exportPath).then(resolve).catch(reject)
          : resolve(parsed);
      });
  });


module.exports = parser;
