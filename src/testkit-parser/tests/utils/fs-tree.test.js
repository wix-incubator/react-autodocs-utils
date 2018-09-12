const fsTree = require('./fs-tree')

describe('fs tree', () => {

  const testCases = [
    {
      spec: 'not modify tree for node_modules',
      input: {
        'react': 'hello'
      },
      expected: {
        'react': 'hello'
      }
    },
    {
      spec: 'expand single level',
      input: {
        './file': 'hello'
      },
      expected: {
        '.': {
          file: 'hello'
        }
      }
    },
    {
      spec: 'expand 2 levels',
      input: {
        './dir/file': 'hello'
      },
      expected: {
        '.': {
          dir: {
            file: 'hello'
          }
        }
      }
    }
  ];

  testCases.forEach(({ spec, input, expected }) => {
    it(`should ${spec}`, () => {
      expect(fsTree(input)).toEqual(expected);
    })

  });
});