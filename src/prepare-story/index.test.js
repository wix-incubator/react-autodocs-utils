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

    it('should required imports to given source', () => {
      const source = 'const something = \'hello\'; export default something;';
      const expectation = `import storyNew from 'wix-storybook-utils/StoryNew';
import { storiesOf } from '@storybook/react';
const something = 'hello';
export default something;`;

      return expect(prepareStory({})(source)).resolves.toEqual(expectation);
    });

    it('should wrap exported object with `story()`', () => {
      const source = 'export default { a: 1 };';
      const expectation = `import storyNew from 'wix-storybook-utils/StoryNew';
import { storiesOf } from '@storybook/react';

export default storyNew({
  a: 1,

  _config: {
    storiesOf: storiesOf
  }
});`;

      return expect(prepareStory({})(source)).resolves.toEqual(expectation);
    });

    it('should add _config to exported object', () => {
      const source = 'export default { a: 1 };';
      const config = { a: 1 };
      const expectation = `import storyNew from 'wix-storybook-utils/StoryNew';
import { storiesOf } from '@storybook/react';

export default storyNew({
  a: 1,

  _config: {
    'a': 1,
    storiesOf: storiesOf
  }
});`;

      return expect(prepareStory(config)(source)).resolves.toEqual(expectation);
    });
  });
});
