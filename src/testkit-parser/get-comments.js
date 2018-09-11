const flatten = require('./utils/flatten');

const supportedAnnotations = {
  '@deprecated': 'isDeprecated'
};

const normalizeLine = line =>
  line
    .replace(/^(\s*\*\s*)/, '')
    .replace(/(\s*\*\s*)$/, '')
    .trim();

const convertCommentNodesToLines = nodes =>
  flatten(nodes.map(({ value }) =>
    value.split('\n').map(normalizeLine)
  ));

const extractAnnotations = lines => {
  const defaultMetadata = { description: '', annotations: {} };
  return lines.reduce((methodMetadata, commentLine) => {
    
    if (supportedAnnotations[commentLine]) {
      // line matches annotation: do not add it to description and set annotation key to object metadata
      const annotationKey = supportedAnnotations[commentLine];
      return {
        ...methodMetadata,
        annotations: { ...methodMetadata.annotations, [annotationKey]: true }
      };
    }
    
    const description = [methodMetadata.description, commentLine]
      .filter(Boolean)
      .join('\n');
    
    return { ...methodMetadata, description };
    
  }, defaultMetadata);
};

const getComments = node => {
  if (!node.leadingComments) {
    return {};
  }
  const lines = convertCommentNodesToLines(node.leadingComments);
  const { annotations, description } = extractAnnotations(lines);
  return { ...annotations, description };
}

module.exports = getComments;