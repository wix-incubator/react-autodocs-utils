const getDefaultExport = require('../get-default-export');

describe('get default export', () => {
  const testCases = [
    { spec: 'export default anonymous function without block statement',
      code: `
      const a = 1;
      export default () => ({
        method: () => {}
      })`
    },
    { spec: 'export default anonymous function with block statement',
      code: `
      const a = 1;
      export default () => {
        return {
          method: () => {}
        }
      }`
    },
    { spec: 'export default function',
      code: `
      const a = 1;
      export default function () {
        return {
          method: () => {}
        }
      }`
    },
    { spec: 'arrow function symbol without block statement',
      code: `
      const driver = () => ({
        method: () => {}
      });
      export default driver;
      `
    },
    { spec: 'arrow function symbol with block statement',
      code: `
      const driver = () => {
        return {
          method: () => {}
        }
      };
      export default driver;
      `
    },
    { spec: 'function declaration symbol',
      code: `
      function driver() {
        return {
          method: function() {}
        }
      };
      export default driver;
      `
    },
    { spec: 'returned identifier',
      code: `
      function driver() {
        const a = {
          method: function() {}
        }; 
        return a;
      };
      export default driver;
      `
    }
  ];

  const expected = [
    { name: 'method', type: 'function', args: [] }
  ];

  testCases.forEach(({spec, code}) => {
    it(`should parse ${spec}`, async () => {
      const result = await getDefaultExport(code);
      expect(result).toEqual(expected);
    });
  });
});
