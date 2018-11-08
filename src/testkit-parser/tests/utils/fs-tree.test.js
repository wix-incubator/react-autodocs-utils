const fsTree = require('./fs-tree');

describe('fs tree', () => {
  const testCases = [
    {
      spec: 'not modify tree for node_modules',
      input: {
        react: 'hello',
      },
      expected: {
        react: 'hello',
      },
    },
    {
      spec: 'expand single level',
      input: {
        './file': 'hello',
      },
      expected: {
        '.': {
          file: 'hello',
        },
      },
    },
    {
      spec: 'expand 2 levels',
      input: {
        './dir/file': 'hello',
      },
      expected: {
        '.': {
          dir: {
            file: 'hello',
          },
        },
      },
    },
    {
      spec: 'add multiple entries to same level',
      input: {
        './file': 'hello',
        './another-file': 'world',
      },
      expected: {
        '.': {
          file: 'hello',
          'another-file': 'world',
        },
      },
    },
    {
      spec: 'add multiple entries to same deep level',
      input: {
        './dir/file': 'hello',
        './dir/another-file': 'world',
      },
      expected: {
        '.': {
          dir: {
            file: 'hello',
            'another-file': 'world',
          },
        },
      },
    },
  ];

  testCases.forEach(({ spec, input, expected }) => {
    it(`should ${spec}`, () => {
      expect(fsTree(input)).toEqual(expected);
    });
  });
});
