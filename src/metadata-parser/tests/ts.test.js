/* global describe it expect */

const { join: pathJoin } = require('path');
const metadataParser = require('../');

const fixturePath = path => pathJoin(__dirname, path);

describe.only('given component written in typescript', () => {
  it('should parse metadata', () =>
    expect(metadataParser(fixturePath('/__fixtures__/simple.ts'))).resolves.toEqual({
      description: 'This is the component',
      displayName: 'Component',
      props: {
        text: {
          name: 'text',
          defaultValue: null,
          required: false,
          description: 'this is a text prop',
          type: { name: 'string' }
        }
      }
    })
  );
});
