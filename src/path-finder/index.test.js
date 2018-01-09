/* global it describe expect */

const pathFinder = require('./');

describe('pathFinder()', () => {
  it('should return a promise', () => {
    expect(pathFinder().then).toBeDefined();
  });

  describe('given valid source', () => {
    it('should resolve promise with value of `componentPath`', () => {
      const expectation = 'hello'.repeat(Math.random() * 19);
      const source = `export default { componentPath: '${expectation}' }`;

      return expect(pathFinder(source)).resolves.toEqual(expectation);
    });
  });
});
