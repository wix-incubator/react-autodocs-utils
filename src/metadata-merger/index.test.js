/* global describe it expect */

const metadataMerger = require('./');

describe('metadataMerger', () => {
  it('should return function', () => {
    expect(typeof metadataMerger()).toBe('function');
  });

  describe('when erroneous input given', () => {
    it('should reject promise with message', () =>
      expect(metadataMerger()()).rejects.toEqual(
        'ERROR: unable to merge `metadata` into exported story config, ensure `source` & `metadata` are defined'
      ));
  });

  describe('with 2 curried calls', () => {
    it('should return promise', () => {
      expect(metadataMerger('"test"')({}).then).toBeDefined();
    });

    it('should add `_metadata` to story config', () => {
      const source = 'export default { a: 1, b: 2 }';
      const metadata = { hello: 1, goodbye: { forReal: 'bye' } };
      const expectation = `export default {
  a: 1,
  b: 2,
  _metadata: {
    "hello": 1,
    "goodbye": {
      "forReal": "bye"
    }
  }
};`;

      return expect(metadataMerger(source)(metadata)).resolves.toEqual(expectation);
    });

    it('should add `_metadata` to referenced story config', () => {
      const source = `
        const config = { a: 1, b: { c: 2 } };
        export default config;
      `;
      const metadata = { whatIs: 'love' };
      const expectation = `const config = {
  a: 1,
  b: {
    c: 2
  },
  _metadata: {
    "whatIs": "love"
  }
};
export default config;`;

      return expect(metadataMerger(source)(metadata)).resolves.toEqual(expectation);
    });
  });
});
