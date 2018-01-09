/* global describe it expect */

const metadataMerger = require('./');

describe('metadataMerger', () => {
  it('should return function', () => {
    expect(typeof metadataMerger()).toBe('function');
  });

  describe('when called twice curried', () => {
    it('should return promise', () => {
      expect(metadataMerger()().then).toBeDefined();
    });

    it('should add `_metadata` to exportable `source`', () => {
      const source = 'export default { a: 1, b: 2 }';
      const metadata = { hello: 1, goodbye: 2 };
      const expectation = `export default {
  a: 1,
  b: 2,

  _metadata: {
    "hello": 1,
    "goodbye": 2
  }
};`;

      return expect(metadataMerger(source)(metadata)).resolves.toEqual(expectation);
    });
  });
});
