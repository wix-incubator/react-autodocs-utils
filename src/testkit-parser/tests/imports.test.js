const getExport = require('../get-export');
const fsTree = require('./utils/fs-tree');

jest.mock('fs');
const fs = require('fs');

describe('import parsing', () => {
  const testCases = [
    { spec: 'default arrow function without block statement',
      code: `
      import driver from './driver.js';
      export default () => ({
        driver
      })`,
      files: {
        './driver.js': `export default () => ({
          method: arg => {}
        })`
      }
    },
    { spec: 'default arrow function with block statement',
      code: `
      import driver from './driver.js';
      export default () => ({
        driver
      })`,
      files: {
        './driver.js': `export default () => {
           return {
             method: arg => {}
           }
        }`
      }
    },
    { spec: 'default function',
      code: `
      import driver from './driver.js';
      export default () => ({
        driver
      })`,
      files: {
        './driver.js': `export default function() {
           return {
             method: arg => {}
           }
        }`
      }
    },
    { spec: 'named arrow function',
      code: `
      import {driver} from './driver.js';
      export default () => ({
        driver
      })`,
      files: {
        './driver.js': `
          export const driver = () => ({
            method: arg => {}
          });
          export default () => ({
            anotherMethod: () => {}
          })`
      }
    }
  ];

  const expected = [
    { name: 'driver', type: 'object', props: [
      { name: 'method', type: 'function', args: [{ name: 'arg' }]}
    ]}
  ];

  testCases.forEach(({spec, code, files}) => {
    it(`should parse ${spec}`, async () => {
      fs.__setFS(fsTree(files));
      const result = await getExport(code);
      expect(result).toEqual(expected);
    });
  });
});
