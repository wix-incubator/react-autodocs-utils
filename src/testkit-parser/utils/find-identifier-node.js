const types = require('@babel/types');
const visit = require('../../parser/visit');

const findIdentifierNode = ({ name, ast }) => {
  let node;
  visit(ast)({
    enter(path) {
      if (path.node.id && path.node.id.name === name) {
        node = path.node;
        path.stop();
      }
    }
  });

  if (!node) {
    throw `Node with id ${name} not found`;
  }

  return node.init || node;
};

module.exports = findIdentifierNode;