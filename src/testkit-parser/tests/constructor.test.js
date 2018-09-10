const parse = require('../index');

describe.only('constructor parser', () => {
  const testCases1 = [
    { spec: 'export default anonymous function',
      code: `
      const a = 1;
      export default ({element, wrapper, component}, flag) => ({
      })`,
      expected: [
        { name: 'constructor', args: [{ name: '{element, wrapper, component}' }, { name: 'flag' }]},
      ]
    },
    { spec: 'export default function',
      code: `
      const a = 1;
      export default function({element, wrapper, component}, flag) {
      }`,
      expected: [
        { name: 'constructor', args: [{ name: '{element, wrapper, component}' }, { name: 'flag' }]},
      ]
    },
    { spec: 'arrow function symbol',
      code: `
      const a = ({element, wrapper, component}, flag) => {};
      export default a;
      `,
      expected: [
        { name: 'constructor', args: [{ name: '{element, wrapper, component}' }, { name: 'flag' }]},
      ]
    },
    { spec: 'function declaration symbol',
      code: `
      function driver({element, wrapper, component}, flag) {};
      export default driver;
      `,
      expected: [
        { name: 'constructor', args: [{ name: '{element, wrapper, component}' }, { name: 'flag' }]},
      ]
    }
  ];
  const testCases2 = [
  ];

  testCases1.forEach(({spec, code, expected}) => {
    it(`should parse ${spec}`, async () => {
      const result = await parse(code);
      expect(result).toEqual(expected);
    });
  });
});
