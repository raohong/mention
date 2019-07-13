import React from 'react';
import { mount } from 'enzyme';
import Mention from '../src';
import { KEY_DOWN, KEY_ENTER } from '../src/constants';

const { Option } = Mention;

const prefix = Mention.clsPrefix;
const inputSelector = `.${prefix}__mention-input`;
const suggestions = [
  { name: 'bob', value: 'bob' },
  { name: 'meszyouh', value: 'meszyouh' },
  { name: 'javascript', value: 'javascript' },
  { name: 'javascript', value: 'java' }
];

describe('Mention structure', () => {
  const split = '>';

  const wrapper = mount(
    <Mention split={split}>
      {suggestions.map(item => (
        <Option key={item.value} value={item.value}>
          {item.name}
        </Option>
      ))}
    </Mention>
  );

  it('contains textarea', () => {
    expect(wrapper.find(inputSelector).length).toEqual(1);
  });

  it('contains mesaure wrapper', () => {
    expect(wrapper.find(`.${prefix}__mention-measure`).length).toEqual(1);
  });

  it('not contains dropdown wrapper', () => {
    expect(wrapper.find(`.${prefix}__mention-dropdown`).length).toEqual(0);
  });

  it('contains mesaure cursor', () => {
    wrapper.find(inputSelector).simulate('change', { target: { value: '@' } });

    expect(wrapper.find(`.${prefix}__mention-measure span`).length).toEqual(1);
  });

  it('contains mention options', () => {
    wrapper.find(inputSelector).simulate('change', { target: { value: '@' } });

    expect(wrapper.find(`.${prefix}__mention-dropdown-item`).length).toEqual(
      suggestions.length
    );
  });

  it('not contains mention options when enter keywords that don`t match', () => {
    wrapper
      .find(inputSelector)
      .simulate('change', { target: { value: '@pig' } });

    expect(wrapper.find(`.${prefix}__mention-dropdown-item`).length).toEqual(0);
  });

  it('contains matched mention options', () => {
    wrapper
      .find(inputSelector)
      .simulate('change', { target: { value: '@mes' } });
    expect(wrapper.find(`.${prefix}__mention-dropdown-item`).length).toEqual(1);

    wrapper
      .find(inputSelector)
      .simulate('change', { target: { value: '@java' } });
    expect(wrapper.find(`.${prefix}__mention-dropdown-item`).length).toEqual(2);
  });
});

describe('Analog select interaction', () => {
  const split = ' ';

  const wrapper = mount(
    <Mention split={split}>
      {suggestions.map(item => (
        <Option key={item.value} value={item.value}>
          {item.name}
        </Option>
      ))}
    </Mention>
  );

  it('when the trigger is triggered, press the Enter key or Down key , Up key , it contains correct value', () => {
    // trigger change
    wrapper.find(inputSelector).simulate('change', {
      target: {
        value: '@'
      }
    });

    // renderd dropdown
    expect(wrapper.find(`.${prefix}__mention-dropdown-item`).length).toEqual(
      suggestions.length
    );

    // defaults selected first  option
    expect(wrapper.state('dropdownActiveIndex')).toEqual(0);

    // trigger key down
    wrapper.find(`.${prefix}__mention-dropdown`).simulate('keyDown', {
      keyCode: KEY_DOWN
    });

    // defaults selected first  option
    expect(wrapper.state('dropdownActiveIndex')).toEqual(1);

    // trigger change again
    wrapper.find(inputSelector).simulate('change', {
      target: {
        value: '@java'
      }
    });

    // defaults selected first  option when keyword changed
    expect(wrapper.state('dropdownActiveIndex')).toEqual(0);

    // trigger enter
    wrapper.find(`.${prefix}__mention-dropdown`).simulate('keyDown', {
      keyCode: KEY_ENTER
    });

    expect(wrapper.find(`.${prefix}__mention-dropdown-item`).length).toEqual(0);

    // changed value
    expect(wrapper.state('value')).toEqual(`@${suggestions[2].value}${split}`);
  });

  it('after wrapping, check the split that does not add settings before the mention', () => {
    const input = wrapper.find(inputSelector);

    const text = `hello
    @`;

    input.simulate('change', { target: { value: '' } });

    input.simulate('change', { target: { value: text } });

    input.simulate('keyDown', { keyCode: KEY_ENTER });

    expect(wrapper.state('value')).toEqual(
      `${text}${suggestions[0].value}${split}`
    );
  });
});

describe('Analog delete interaction  after select', () => {
  const split = ' ';

  const wrapper = mount(
    <Mention split={split}>
      {suggestions.map(item => (
        <Option key={item.value} value={item.value}>
          {item.name}
        </Option>
      ))}
    </Mention>
  );

  it('when deleteMode is set to "whole", after the first mention is selected, the character is deleted, and the selected mention is deleted as a whole.', () => {
    const input = wrapper.find(inputSelector);

    wrapper.setState({ value: '' });

    input.simulate('change', {
      target: {
        value: '@'
      }
    });

    input.simulate('keyDown', {
      keyCode: KEY_ENTER
    });

    const nextValue = wrapper.state('value').slice(0, -1);

    // simulate backsapace action
    input.simulate('change', {
      target: {
        value: nextValue,
        selectionStart: nextValue.length,
        selectionEnd: nextValue.length
      }
    });

    expect(wrapper.state('value')).toEqual('');
  });

  it('remove characters from the middle of a selected mention', () => {
    const input = wrapper.find(inputSelector);

    wrapper.setState({ value: '' });

    input.simulate('change', {
      target: {
        value: '@'
      }
    });

    input.simulate('keyDown', {
      keyCode: KEY_ENTER
    });

    const nextValue = wrapper.state('value').slice(0, 3);

    input.simulate('change', {
      target: {
        value: nextValue,
        selectionEnd: nextValue.length,
        selectionStart: nextValue.length
      }
    });

    expect(wrapper.state('value')).toEqual('');
  });
});
