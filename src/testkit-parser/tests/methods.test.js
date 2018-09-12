const getExport = require('../get-export');

describe('get object methods', () => {
  const testCases = [
    { spec: 'no args',
      code: `
      export default () => ({
        methodA: () => {},
        methodB: () => {}
      })`,
      expected: [
        { name: 'methodA', type: 'function', args: [] },
        { name: 'methodB', type: 'function', args: [] }
      ]
    },
    { spec: 'one arg',
      code: `
      export default () => ({
        methodA: arg => {},
        methodB: (arg) => {}
      })`,
      expected: [
        { name: 'methodA', type: 'function', args: [ {name: 'arg' }]},
        { name: 'methodB', type: 'function', args: [ {name: 'arg' }]}
      ]
    },
    { spec: 'multiple args',
      code: `
      export default () => ({
        methodA: (arg1, arg2) => {}
      })`,
      expected: [
        { name: 'methodA', type: 'function', args: [ {name: 'arg1' }, {name: 'arg2' }]}
      ]
    },
    { spec: 'function declaration',
      code: `
      export default () => ({
        methodA: function (arg1, arg2) {}
      })`,
      expected: [
        { name: 'methodA', type: 'function', args: [ {name: 'arg1' }, {name: 'arg2' }]}
      ]
    },
    { spec: 'object destructuring',
      code: `
      export default () => ({
        methodA: ({ arg1, arg2 }, arg3) => {}
      })`,
      expected: [
        { name: 'methodA', type: 'function', args: [ {name: '{arg1, arg2}' }, {name: 'arg3' }]}
      ]
    },
    { spec: 'arrow function identifier',
      code: `
      const methodA = ({ arg1, arg2 }) => {}
      export default () => ({
        methodA
      })`,
      expected: [
        { name: 'methodA', type: 'function', args: [ {name: '{arg1, arg2}' }]}
      ]
    },
    { spec: 'function identifier',
      code: `
      const methodA = function({ arg1, arg2 }) {}
      export default () => ({
        methodA
      })`,
      expected: [
        { name: 'methodA', type: 'function', args: [ {name: '{arg1, arg2}' }]}
      ]
    },
    { spec: 'function declaration',
      code: `
      function methodA({ arg1, arg2 }) { };
      export default () => ({
        methodA
      })`,
      expected: [
        { name: 'methodA', type: 'function', args: [ {name: '{arg1, arg2}' }]}
      ]
    },
    { spec: 'object spread',
      code: `
      const subDriver = { 
        methodB: () => {},
        methodC: (arg1, arg2) => {},
      }
      export default () => ({
        methodA: () => {},
        ...subDriver
      })`,
      expected: [
        { name: 'methodA', type: 'function', args: [] },
        { name: 'methodB', type: 'function', args: [] },
        { name: 'methodC', type: 'function', args: [{ name: 'arg1' }, { name: 'arg2' }]}
      ]
    },
    { spec: 'assignment pattern',
      code: `
      export default () => ({
        method: (arg = 1) => {}
      })`,
      expected: [
        { name: 'method', type: 'function', args: [{ name: 'arg' }]}
      ]
    },
    { spec: 'non-function keys',
      code: `
      export default () => ({
        notMethod: true,
        number: 1
      })`,
      expected: [
        { name: 'notMethod', type: 'value'},
        { name: 'number', type: 'value'}
      ]
    },
    { spec: 'constructor arg as key',
      code: `
      export default ({ arg }) => ({
        arg
      })`,
      expected: [
        { name: 'arg', type: 'unknown'},
      ]
    },
    { spec: 'logical expression',
      code: `
      export default ({ arg }) => {
        const driver = arg && { method: () => {} }
        return {
          driver
        }
      }`,
      expected: [
        { name: 'driver', type: 'object', props: [
          { name: 'method', type: 'function', args: []}
        ]}
      ]
    },
    { spec: 'object spread on function call',
      code: `
        const factory = () => ({
          driver: {
            method: () => {}
          }
        });
        
        export default () => {
          return {
            ...factory()
          }
        };
      `,
      expected: [
        { name: 'driver', type: 'object', props: [
          { name: 'method', type: 'function', args: []}
        ]}
      ]
    }
  ];

  testCases.forEach(({spec, code, expected}) => {
    it(`should parse ${spec}`, async () => {
      const result = await getExport(code);
      expect(result).toEqual(expected);
    });
  });
});
