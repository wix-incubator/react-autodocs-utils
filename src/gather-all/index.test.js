/* global jest describe it expect beforeEach */

const gatherAll = require('./');

jest.mock('fs');
const fs = require('fs');

const componentSourceMock = `
  import PropTypes from 'prop-types';
  const component = () => <div/>;
  component.propTypes = { test: PropTypes.string.isRequired };
  export default component;
`;

const metadataMock = {
  description: '',
  methods: [],
  props: {
    test: {
      description: '',
      required: true,
      type: {
        name: 'string'
      }
    }
  }
};

const readmeMock = '# Hello readme!';
const readmeAccessibilityMock = '# Hello Accessiblity!';
const readmeTestkitMock = '# Hello Testkit!';

describe('gatherAll', () => {
  beforeEach(fs.__reset);

  describe('given path argument', () => {
    describe('which is empty folder', () => {
      it('should reject with error', () => {
        fs.__setFolder('some-path')([]);
        expect(gatherAll('some-path'))
          .rejects
          .toEqual(new Error('Unable to find required `index.js` in path "some-path"'));
      });
    });

    describe('which is folder with index.js, README.md, README.accessibility.md and README.testkit.md', () => {
      it('should resolve with component metadata', () => {
        fs.__setFolder('component-folder')([
          'index.js',
          'readme.md',
          'readme.accessibility.md',
          'readme.testkit.md'
        ]);
        fs.__setFile('component-folder/index.js')(componentSourceMock);
        fs.__setFile('component-folder/readme.md')(readmeMock);
        fs.__setFile('component-folder/readme.accessibility.md')(readmeAccessibilityMock);
        fs.__setFile('component-folder/readme.testkit.md')(readmeTestkitMock);

        return expect(gatherAll('component-folder')).resolves.toEqual({
          ...metadataMock,
          readme: readmeMock,
          readmeAccessibility: readmeAccessibilityMock,
          readmeTestkit: readmeTestkitMock
        });
      });
    });
  });

  describe('when called without path', () => {
    it('should reject promise with error', () =>
      expect(gatherAll()).rejects.toEqual(
        'Error: gatherAll is missing required `path` argument'
      )
    );
  });
});
