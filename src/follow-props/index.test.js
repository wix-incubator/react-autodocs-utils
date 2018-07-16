/* global jest describe it expect */

jest.mock('fs');
const fs = require('fs');

// this function was extracted from `metadataParser` which
// has the functionality of `followProps` tested over there.
// hence, not many tests live here but behaviour is covered.
const followProps = require('./');

describe('followProps()', () => {
  describe('given component with deeply composed props that live in sibling folders', () => {
    it('should resolve paths correctly', () => {
      const entrySource = `
        import PropTypes from 'prop-types';
        import React from 'react';
        import OtherComponent from '../../OtherComponent/OtherComponent';

        export default class EntryComponent extends React.Component {
          static propTypes = {
            ...OtherComponent.propTypes,
            disabled: PropTypes.bool
          };

          render() {
            return <div/>;
          }
        }`;

      fs.__setFS({
        src: {
          Backoffice: {
            Component: {
              'index.js': entrySource
            }
          },

          OtherComponent: {
            'OtherComponent.js': `
              import React from 'react';
              import PropTypes from 'prop-types';
              import OneUpComponent from '../OneUpComponent';

              export default class extends React.Component {
                static propTypes = {
                  ...OneUpComponent.propTypes,
                  link: PropTypes.string
                };

                render() {
                  return (<div/>);
                }
              }`
          },

          OneUpComponent: {
            'index.js': `
              import React from 'react';
              import PropTypes from 'prop-types';
              const component = () => <div/>;
              component.propTypes = {
                veryDeep: PropTypes.bool.isRequired
              }
              export default component;
            `
          }
        }
      });

      return expect(followProps({ source: entrySource, path: 'src/Backoffice/Component/index.js' })).resolves.toEqual({
        description: '',
        displayName: 'EntryComponent',
        methods: [],
        props: {
          disabled: {
            description: '',
            required: false,
            type: { name: 'bool' }
          },
          link: {
            description: '',
            required: false,
            type: { name: 'string' }
          },
          veryDeep: {
            description: '',
            required: true,
            type: { name: 'bool' }
          }
        }
      });
    });
  });
});
