//{element, wrapper, component}, flag

const getDefaultExport = require('../get-default-export');

describe('get object methods', () => {
  const testCases = [
    { spec: 'no args',
      code: `
      export default () => ({
        methodA: () => {},
        methodB: () => {}
      })`,
      expected: [
        { name: 'methodA', args: [] },
        { name: 'methodB', args: [] }
      ]
    }
  ];

  testCases.forEach(({spec, code, expected}) => {
    it(`should parse ${spec}`, async () => {
      const result = await getDefaultExport(code);
      expect(result).toEqual(expected);
    });
  });
});
