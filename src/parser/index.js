/* global Promise */

const {parse: reactDocgenParser} = require('react-docgen');

const componentResolver = require('./component-resolver');
const fileReader = require('../file-reader');

const parser = source =>
  reactDocgenParser(source, componentResolver);

const handleComposedProps = parsed =>
  Promise
    .all(parsed.composes.map(fileReader))

    .then(composedSources =>
      Promise.all(composedSources.map(parser))
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

module.exports = source => {
  const parsed = parser(source);

  return new Promise((resolve, reject) =>
    parsed.composes ?
      handleComposedProps(parsed).then(resolve).catch(reject) :
      resolve(parsed)
  );
};
