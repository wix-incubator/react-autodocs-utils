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
        name: 'string',
      },
    },
  },
};

const readmeMock = '# Hello readme!';
const readmeAccessibilityMock = '# Hello Accessiblity!';
const readmeTestkitMock = '# Hello Testkit!';

describe('gatherAll', () => {
  describe('given path argument', () => {
    describe('which is empty folder', () => {
      it('should reject with error', () => {
        fs.__setFS({
          'some-path': {},
        });

        return gatherAll('some-path').catch(({ message }) => {
          expect(message).toMatch('Unable to parse component in path "some-path", reason:');
        });
      });
    });

    describe('which is folder with index.js, README.md, README.accessibility.md and README.testkit.md', () => {
      it('should resolve with component metadata', () => {
        fs.__setFS({
          'component-folder': {
            'index.js': componentSourceMock,
            'readme.md': readmeMock,
            'readme.accessibility.md': readmeAccessibilityMock,
            'readme.testkit.md': readmeTestkitMock,
          },
        });

        return expect(gatherAll('component-folder')).resolves.toEqual({
          ...metadataMock,
          displayName: 'component',
          readme: readmeMock,
          readmeAccessibility: readmeAccessibilityMock,
          readmeTestkit: readmeTestkitMock,
          drivers: [],
        });
      });
    });

    describe('which is folder with index.js and some markdowns with various cases', () => {
      it('should resolve with component metadata', () => {
        fs.__setFS({
          'component-folder': {
            'index.js': componentSourceMock,
            'README.md': readmeMock,
            'readme.accessibility.md': readmeAccessibilityMock,
            'README.testkit.md': readmeTestkitMock,
          },
        });

        return expect(gatherAll('component-folder')).resolves.toEqual({
          ...metadataMock,
          displayName: 'component',
          readme: readmeMock,
          readmeAccessibility: readmeAccessibilityMock,
          readmeTestkit: readmeTestkitMock,
          drivers: [],
        });
      });
    });

    describe('which is folder with component importing from node_modules', () => {
      it('should resolve with component metadata', () => {
        fs.__setFS({
          src: {
            components: {
              Badge: {
                'index.js': `import * as React from 'react';
                  import {Badge as CoreBadge} from 'wix-ui-core/Badge';
                  const component = () => <div/>;
                  component.propTypes = {
                    ...CoreBadge.propTypes,
                  };
                  export default component;
                  `,
              },
            },
          },

          node_modules: {
            'wix-ui-core': {
              'Badge.js': "module.exports = require('./dist/src/components/Badge');",

              src: {
                components: {
                  Badge: {
                    'index.js': componentSourceMock,
                  },
                },
              },
            },
          },
        });

        return expect(gatherAll('src/components/Badge')).resolves.toEqual({
          description: '',
          methods: [],
          displayName: 'component',
          props: {
            test: {
              description: '',
              required: true,
              type: {
                name: 'string',
              },
            },
          },
          readme: '',
          readmeAccessibility: '',
          readmeTestkit: '',
          drivers: [],
        });
      });
    });

    describe('which is folder with components of various extensions', () => {
      it('should resolve with component metadata', () => {
        fs.__setFS({
          folder: {
            'index.jsx': `
              import PropTypes from 'prop-types';
              import composed from 'some-module/Component';
              const component = () => <div/>;
              component.propTypes = { ...composed.propTypes };
              export default component;
            `,

            'readme.md': readmeMock,
            'readme.accessibility.md': readmeAccessibilityMock,
            'readme.testkit.md': readmeTestkitMock,
          },

          node_modules: {
            'some-module': {
              'Component.js': `
              import PropTypes from 'prop-types';
              const component = () => <div/>;
              component.propTypes = { test: PropTypes.string.isRequired };
              export default component;
              `,
            },
          },
        });

        return expect(gatherAll('folder')).resolves.toEqual({
          ...metadataMock,
          displayName: 'component',
          readme: readmeMock,
          readmeAccessibility: readmeAccessibilityMock,
          readmeTestkit: readmeTestkitMock,
          drivers: [],
        });
      });

      it('should resolve real world scenario', () => {
        fs.__setFS({
          src: {
            components: {
              Badge: {
                'index.js': `import * as React from 'react';
                  import {oneOf} from 'prop-types';
                  import {Badge as CoreBadge} from 'wix-ui-core/Badge';
                  export class Badge extends React.PureComponent {
                    static propTypes = {
                      ...CoreBadge.propTypes,
                      skin: oneOf(['red', 'blue'])
                    }

                    render() {
                      return <div/>;
                    }
                  }`,

                'readme.md': readmeMock,
                'readme.accessibility.md': readmeAccessibilityMock,
                'readme.testkit.md': readmeTestkitMock,
              },
            },
          },

          node_modules: {
            'wix-ui-core': {
              'Badge.js': "module.exports = require('./dist/src/components/Badge');",

              src: {
                components: {
                  Badge: {
                    'index.js': `import * as React from 'react';
                      import BadgeComponent from './Badge';
                      import {withClasses} from 'wix-ui-jss';
                      import {styles} from './styles';
                      export default withClasses(BadgeComponent, styles)
                      `,

                    'Badge.jsx': `import * as React from 'react';
                      import {string} from 'prop-types';
                      const Badge = () => <div/>;
                      Badge.propTypes = {
                        children: string
                      }
                      export default Badge;
                      `,
                  },
                },
              },
            },
          },
        });

        return expect(gatherAll('src/components/Badge')).resolves.toEqual({
          description: '',
          methods: [],
          displayName: 'Badge',
          props: {
            skin: {
              description: '',
              type: {
                name: 'enum',
                value: [{ computed: false, value: "'red'" }, { computed: false, value: "'blue'" }],
              },
              required: false,
            },
            children: {
              type: {
                name: 'string',
              },
              description: '',
              required: false,
            },
          },
          readme: readmeMock,
          readmeAccessibility: readmeAccessibilityMock,
          readmeTestkit: readmeTestkitMock,
          drivers: [],
        });
      });
    });

    describe('which is path to concrete file', () => {
      it('should resolve with component metadata', () => {
        fs.__setFS({
          'index.js': componentSourceMock,
          'readme.md': readmeMock,
          'readme.accessibility.md': readmeAccessibilityMock,
          'readme.testkit.md': readmeTestkitMock,
        });

        return expect(gatherAll('index.js')).resolves.toEqual({
          ...metadataMock,
          displayName: 'component',
          readme: readmeMock,
          readmeAccessibility: readmeAccessibilityMock,
          readmeTestkit: readmeTestkitMock,
          drivers: [],
        });
      });
    });
  });

  describe('when called without path', () => {
    it('should reject promise with error', () =>
      expect(gatherAll()).rejects.toEqual('Error: gatherAll is missing required `path` argument'));
  });
});
