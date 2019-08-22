const isDriver = require('./is-driver');

describe('isDriver', () => {
  [['file.driver.js', true], ['file.private.driver.js', false]].map(([assertion, expecation]) => {
    it('given ${assertion} it should return ${expecation}', () => {
      expect(isDriver(assertion)).toEqual(expecation);
    });
  });
});
