/* global Promise describe it expect jest afterEach */

const metadataParser = require('./');

jest.mock('fs');
const fs = require('fs');

const rootMock = {
  description: '',
  methods: []
};

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
        it('should return initial object', () => {
          const [path, source] = [
            'simple-functional.js',
            `import React from 'react';
             export default () => <div>Hello World!</div>;`
          ];

          fs.__setFile(path)(source);

          return expect(metadataParser(path)).resolves.toEqual(rootMock);
        });
      });

      describe('that has props', () => {
        it('should return props object with correct type', () => {
          const [path, source] = [
            'functional-with-props.js',
            `import React from 'react';
            import PropTypes from 'prop-types';
            const component = () => <div></div>;
            component.propTypes = {
              /** hello comment */
              hello: PropTypes.bool,

              /** goodbye comment */
              goodbye: PropTypes.string.isRequired,

              /** Mr. Deez
               *  Nuts
               *  */
              nuts: PropTypes.oneOf(['deez', 'deeez'])
            };
            export default component;
            `
          ];

          fs.__setFile(path)(source);

          return expect(metadataParser(path)).resolves.toEqual({
            description: '',
            methods: [],
            props: {
              hello: {
                description: 'hello comment',
                required: false,
                type: { name: 'bool' }
              },

              goodbye: {
                description: 'goodbye comment',
                required: true,
                type: { name: 'string' }
              },

              nuts: {
                description: 'Mr. Deez\n Nuts',
                required: false,
                type: {
                  name: 'enum',
                  value: [
                    { computed: false, value: "'deez'" },
                    { computed: false, value: "'deeez'" }
                  ]
                }
              },


            }
          });
        });
      });
    });
  });
});
