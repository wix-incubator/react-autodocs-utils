/* global Promise describe it expect jest afterEach */

const metadataParser = require('./');

jest.mock('fs');
const fs = require('fs');

describe('metadataParser()', () => {
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

  describe('given existing path', () => {
    afterEach(() => fs.__reset());

    describe('with component source', () => {
      describe('that has no useful data', () => {
        it('should return empty object', () => {
          const [path, source] = [
            'simple-functional.js',
            `import React from 'react';
             export default () => <div>Hello World!</div>;`
          ];

          fs.__setFile(path)(source);

          return expect(metadataParser(path)).resolves.toEqual({});
        });
      });

      describe.skip('that has one prop', () => {
        it('should return props object with correct type', () => {
          const [path, source] = [
            'functional-with-props.js',
            `import React from 'react';
            import PropTypes from 'prop-types';
            const component = () => {};
            component.PropTypes = { hello: PropTypes.bool };
            export default component;
            `
          ];

          fs.__setFile(path)(source);
          return expect(metadataParser(path)).resolves.toEqual({
            props: {
              hello: {
                type: 'bool',
                isRequired: false
              }
            }
          });
        });
      });
    });
  });
});
