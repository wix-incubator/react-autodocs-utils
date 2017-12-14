/* global Promise describe it expect */

const metadataParser = require('./');
const rawLoader = require('../../test/raw-loader');

const sourceLoader = rawLoader(__dirname);

describe('metadataParser', () => {
  it('should be a function', () => {
    expect(typeof metadataParser).toBe('function');
  });


  describe('when called without parameters', () => {
    it('should reject with error', () => {
      return metadataParser().catch(error => {
        expect(error).toEqual(new Error('ERROR: Missing required `path` argument'));
      });
    });
  });

  describe('given path string', () => {
    it('should return component source', () => {
      const path = './__fixtures__/simple-functional.js';

      return Promise
        .all([
          sourceLoader(path),
          metadataParser(path)
        ])
        .then(([expectedSource, parsedSource]) => {
          expect(expectedSource).toEqual(parsedSource);
        });
    });
  });
});
