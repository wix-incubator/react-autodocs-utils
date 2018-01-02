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

const handleComposedProps = parsed =>
  Promise
    .all(parsed.composes.map(fileReader))

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

    .catch(console.log);

const followExportDefault = (source, cwd) => {
  return new Promise(resolve => {
    let proxiedPath = '';

    const visitExportDefault = source => {
      proxiedPath = '';

      recast.visit(
        recastParser(source),
        {
          visitExportNamedDeclaration: function(path) {
            const isSpecifierDefault =
              path.node.specifiers.some(({ exported }) => exported.name === 'default');

            if (isSpecifierDefault) {
              proxiedPath = path.node.source.value;

              return false;
            }

            this.traverse(path);
          }
        }
      );

      if (proxiedPath) {
        console.log('fak',  cwd, proxiedPath, path.relative(path.dirname(cwd), proxiedPath));
        const resolvedPath = path.resolve(path.dirname(cwd), proxiedPath);

        console.log('shit', resolvedPath);
        fileReader(resolvedPath)
          .then(visitExportDefault)
          .catch(e => console.log(`ERROR: unable to read ${resolvedPath}`, e));
      } else {
        resolve(source);
      }
    };

    visitExportDefault(source);
  });
};

const parser = (source, {cwd}) =>
  new Promise((resolve, reject) => {
    followExportDefault(source, cwd)
      .then(source => {
        const parsed = reactDocgenParser(source);

        return parsed.composes ?
          handleComposedProps(parsed).then(resolve).catch(reject) :
          resolve(parsed);
      });
  });

module.exports = parser;
