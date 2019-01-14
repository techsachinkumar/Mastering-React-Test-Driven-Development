import React from 'react';
import { mount } from 'enzyme';
import { MenuButtons } from '../src/MenuButtons';

describe('MenuButtons', () => {
  let wrapper;

  it('renders', () => {
    wrapper = mount(<MenuButtons />);
    expect(wrapper.find('MenuButtons').exists()).toBeTruthy();
  });
});
