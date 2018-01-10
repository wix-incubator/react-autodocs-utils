/* global describe it expect */

const prepareStory = require('./');

describe('prepareStory', () => {
  it('should be a function', () => {
    expect(typeof prepareStory).toBe('function');
  });

  describe('when erroneous input given', () => {
    it('should reject promise with message', () =>
      expect(prepareStory()())
        .rejects
        .toEqual('ERROR: unable to prepare story, both `storyConfig` and `source` must be provided')
    );
  });

  describe('with 2 curried calls', () => {
    it('should return promise', () => {
      expect(prepareStory({})('test').then).toBeDefined();
    });

    it('should add import to given source', () => {
      const source = 'const something = \'hello\'; export default something;';
      const expectation = `import story from 'wix-storybook-utils/Story';
const something = 'hello';
export default something;`;

      return expect(prepareStory({})(source)).resolves.toEqual(expectation);
    });

    it('should wrap exported object with `story()`', () => {
      const source = 'export default { a: 1 };';
      const expectation = `import story from 'wix-storybook-utils/Story';

export default story({
  a: 1,
  _config: {}
});`;

      return expect(prepareStory({})(source)).resolves.toEqual(expectation);
    });

    it('should add _config to exported object', () => {
      const source = 'export default { a: 1 };';
      const config = { a: 1 };
      const expectation = `import story from 'wix-storybook-utils/Story';

export default story({
  a: 1,

  _config: {
    'a': 1
  }
});`;

      return expect(prepareStory(config)(source)).resolves.toEqual(expectation);
    });
  });
});
