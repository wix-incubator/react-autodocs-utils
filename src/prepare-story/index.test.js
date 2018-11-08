/* global describe it expect */

const prepareStory = require('./');

describe('prepareStory', () => {
  it('should be a function', () => {
    expect(typeof prepareStory).toBe('function');
  });

  describe('when erroneous input given', () => {
    it('should reject promise with message', () =>
      expect(prepareStory()()).rejects.toEqual(
        'ERROR: unable to prepare story, both `storyConfig` and `source` must be provided'
      ));
  });

  describe('with 2 curried calls', () => {
    it('should return promise', () => {
      expect(prepareStory({})('test').then).toBeDefined();
    });

    it('should reject with error when exported config is not an object', () => {
      const source = `const something = "hello";
export default something;`;

      return expect(prepareStory({})(source)).rejects.toMatch('ERROR');
    });

    it('should wrap exported object with `story()`', () => {
      const source = 'export default { a: 1 };';
      const expectation = `import story from "wix-storybook-utils/Story";
import { storiesOf } from "@storybook/react";
export default story({
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
      const expectation = `import story from "wix-storybook-utils/Story";
import { storiesOf } from "@storybook/react";
export default story({
  a: 1,
  _config: {
    "a": 1,
    storiesOf: storiesOf
  }
});`;

      return expect(prepareStory(config)(source)).resolves.toEqual(expectation);
    });

    it('should work with referenced story config', () => {
      const source = `
        const config = { a: 1 };
        export default config;
      `;
      const config = { hello: 'config!' };
      const expectation = `import story from "wix-storybook-utils/Story";
import { storiesOf } from "@storybook/react";
const config = {
  a: 1,
  _config: {
    "hello": "config!",
    storiesOf: storiesOf
  }
};
export default story(config);`;

      return expect(prepareStory(config)(source)).resolves.toEqual(expectation);
    });

    it('should work with spread properties', () => {
      const source = `
        const stuff = { thing: { moreThings: ['hello'] } };
        export default {
          a: 1,
          b: {
            ...stuff,
            c: ['d']
          }
        };
      `;

      const config = { 'i-am-config': 'yes' };

      const expectation = `import story from "wix-storybook-utils/Story";
import { storiesOf } from "@storybook/react";
const stuff = {
  thing: {
    moreThings: ['hello']
  }
};
export default story({
  a: 1,
  b: { ...stuff,
    c: ['d']
  },
  _config: {
    "i-am-config": "yes",
    storiesOf: storiesOf
  }
});`;

      return expect(prepareStory(config)(source)).resolves.toEqual(expectation);
    });
  });
});
