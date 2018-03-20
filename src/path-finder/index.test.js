/* global it describe expect */

const pathFinder = require('./');

describe('pathFinder()', () => {
  describe('given `componentPath`', () => {
    it('should resolve promise with value of `componentPath`', () => {
      const expectation = '.' + 'hello'.repeat(Math.random() * 19);
      const source = `export default { componentPath: '${expectation}' }`;

      return expect(pathFinder(source)).resolves.toEqual(expectation);
    });
  });

  describe('given `component` without `componentPath`', () => {
    describe('when `component` is imported', () => {
      const path = './path';
      const sourceTestCases = [
        `import Component from '${path}';
        export default {
          component: Component
        }`,

        `import * as Component from '${path}'
        export default {
          component: Component
        }`,

        `import {Component} from '${path}'
        export default {
          component: Component
        }`,

        `import {Component, Something, Different} from '${path}'
        export default {
          component: Component
        }`,

        `import {Component as ComponentAlias} from '${path}'
        export default {
          component: ComponentAlias
        }`,

        `import defaultExport, {Component as ComponentAlias} from '${path}'
        export default {
          component: ComponentAlias
        }`,

        `export {default} from '${path}';`
      ];

      sourceTestCases.map(source =>
        it('should resolve promise with path to component', () =>
          expect(pathFinder(source)).resolves.toEqual(path)
        ));
    });
  });
});
