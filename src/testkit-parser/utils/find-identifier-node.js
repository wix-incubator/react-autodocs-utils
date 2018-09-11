const types = require('@babel/types');
const flatten = require('./flatten');

const findNodeByName = ({ nodes, name }) => {
  const node = nodes.find(n => n.id && n.id.name === name);
  if (!node) {
    throw `node with name "${name}" not found`;
  }
  return node.init ? node.init : node;
};

const flattenVariableDeclarations = nodes =>
  flatten(
    nodes
      .filter(types.isVariableDeclaration)
      .map(node => node.declarations)
  );

const findIdentifierNode = ({ nodes, name }) => {
  try {
    return findNodeByName({ nodes, name });
  } catch (e) {
    // ignore not found error
  }
  return findNodeByName({ nodes: flattenVariableDeclarations(nodes), name });
};

module.exports = findIdentifierNode;