/* global Promise */

const { join: pathJoin, dirname: pathDirname } = require('path');
const reactDocgenParse = require('../parser/react-docgen-parse');

const readFile = require('../read-file');
const followExports = require('../follow-exports');
const resolveNodeModules = require('../resolve-node-modules');


const followProps = (parsed, currentPath) =>
  Promise
    .all(
      parsed.composes.map(composedPath => {
        const readablePathPromise =
          composedPath.startsWith('.')
            ? Promise.resolve(pathJoin(pathDirname(currentPath), composedPath))
            : resolveNodeModules(currentPath, composedPath);

        return readablePathPromise
          .then(readFile);
      })
    )

    .then(composedSourcesAndPaths =>
      Promise.all(
        composedSourcesAndPaths.map(({ source, path }) => followExports(source, path))
      )
    )

    .then(composedSourcesAndPaths =>
      Promise.all(
        composedSourcesAndPaths.map(({ source, exportPath }) =>
          reactDocgenParse(source, { path: exportPath })
        )
      ))

    .then(parsedComponents => {
      // here we receive list of object containing parsed component
      // props. some of them may contain composed props from other
      // components, in which case we followProps again recursively

      const withComposed = parsedComponents
        .filter(parsed => parsed.composes)
        .map(parsed => followProps(parsed, currentPath));

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


module.exports = followProps;
