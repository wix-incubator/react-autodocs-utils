/* global describe it expect jest */

const followExports = require('./');

jest.mock('fs');
const fs = require('fs');

describe('followExports()', () => {
  describe('given source', () => {
    describe('which does not have exports', () => {
      it('should return original source', () => {
        const source = 'const hey = "now"';

        return expect(followExports(source)).resolves.toEqual({ source, path: '' });
      });
    });

    describe('which has module.exports', () => {
      it('should return source of that export', () => {
        const source = 'module.exports = require(\'./index.js\')';

        fs.__setFS({
          'index.js': 'hello'
        });

        return expect(followExports(source, '')).resolves.toEqual({
          source: 'hello',
          path: 'index.js'
        });
      });

      it('should return source of resolved file without exports', () => {
        const source = 'export {default} from \'./file.js\'';

        fs.__setFS({
          node_modules: {
            'file.js': 'export {default} from \'../nested/deep/index.js\'',
          },

          nested: {
            deep: {
              'index.js': 'export {default} from \'../sibling.js\''
            },
            'sibling.js': 'hello'
          }
        });

        return expect(followExports(source, 'node_modules')).resolves.toEqual({
          source: 'hello',
          path: 'nested/sibling.js'
        });
      });
    });

    describe('which has `withStylable` HOC', () => {
      it('should resolve component', () => {
        const source = `
            import {
              Component as CoreComponent,
              ComponentProps as CoreComponentProps
            } from 'wix-ui-core/Component';
            import {withStylable} from 'wix-ui-core';

            export const Component = withStylable<CoreComponentProps, ComponentProps>(
              CoreComponent,
              {},
              i => i,
              {}
            );
          `;

        fs.__setFS({
          'index.ts': source,

          node_modules: {
            'wix-ui-core': {
              'Component.js': 'hello'
            }
          }
        });

        return expect(followExports(source, '')).resolves.toEqual({
          source: 'hello',
          path: 'node_modules/wix-ui-core/Component.js'
        });
      });

      // TODO: this would be a helpful feature, leaving skipped test for future reference
      describe.skip('with props interface which is in same file', () => {
        it('should add additional `composedProps` property with parsed interface', () => {
          const source = `
            import { Component as CoreComponent } from 'wix-ui-core/Component';
            import {withStylable} from 'wix-ui-core';

            export interface AdditionalProps {
              /** font size of the text */
              size?: Size;

              /** is the text type is secondary. Affects the font color */
              secondary?: boolean;

              /** skin color of the text */
              skin?: Skin;

              /** is the text has dark or light skin */
              light?: boolean;

              /** is the text bold */
              bold?: boolean;
            }

            export const Component = withStylable<CoreComponentProps, AdditionalProps>(
              CoreComponent,
              {},
              i => i,
              {}
            );
          `;

          fs.__setFS({
            'index.ts': source,

            node_modules: {
              'wix-ui-core': {
                'Component.js': 'hello'
              }
            }
          });

          return expect(followExports(source, '')).resolves.toEqual({
            source: 'hello',
            path: 'node_modules/wix-ui-core/Component.js',
            composedProps: {
              size: {
                name: 'size',
                required: false,
                type: { name: 'Size' },
                description: 'font size of the text',
                defaultValue: undefined
              },
              skin: {
                name: 'skin',
                required: false,
                type: { name: 'string' },
                description: 'skin color of the text',
                defaultValue: undefined
              },
              secondary: {
                name: 'secondary',
                required: false,
                type: { name: 'boolean' },
                description: 'is the text type is secondary. Affects the font color',
                defaultValue: undefined
              },
              light: {
                name: 'light',
                required: false,
                type: { name: 'boolean' },
                description: 'is the text has dark or light skin',
                defaultValue: undefined
              },
              bold: {
                name: 'bold',
                required: false,
                type: { name: 'boolean' },
                description: 'is the text bold',
                defaultValue: undefined
              }
            }
          });
        });
      });
    });

    describe('which has `createHOC` HOC', () => {
      it('should resolve component', () => {
        const source = `
            import {
              Component as CoreComponent
            } from './Label.js';

            export const Label = createHOC(CoreComponent);
        `;

        fs.__setFS({
          'index.js': source,
          'Label.js': 'hello'
        });

        return expect(followExports(source, '')).resolves.toEqual({
          source: 'hello',
          path: 'Label.js'
        });
      });
    });

    describe('which exports with `withClasses` hoc', () => {
      it('should return source of component', () => {
        const source = 'module.exports = require(\'./dist/src/components/component\');';

        fs.__setFS({
          'index.js': source,

          src: {
            components: {
              component: {
                'index.js': `
                  import Component from './component.js';
                  export default withClasses(Component, styles)`,
                'component.js': 'hello'
              }
            }
          }
        });

        return expect(followExports(source, '')).resolves.toEqual({
          source: 'hello',
          path: 'src/components/component/component.js'
        });
      });
    });

    describe('which has a single non default export', () => {
      it('should return source of component', () => {
        const source = 'export {Component, AnythingElse} from \'./thing.js\'\n\'should ignore me\'';

        fs.__setFS({
          'thing.js': 'hey!'
        });

        return expect(followExports(source, '')).resolves.toEqual({
          source: 'hey!',
          path: 'thing.js'
        });
      });
    });

    describe('which has `export default Identifier`', () => {
      it('should return source of that export', () => {
        const source = `
          import Component from \'./Component\';
          export default Component;
        `;

        fs.__setFS({
          Component: {
            'index.js': 'hello'
          }
        });

        return expect(followExports(source, '')).resolves.toEqual({
          path: 'Component/index.js',
          source: 'hello'
        });
      });
    });
  });
});
