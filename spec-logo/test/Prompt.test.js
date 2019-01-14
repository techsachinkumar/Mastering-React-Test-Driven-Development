import React from 'react';
import { mount } from 'enzyme';
import { StoreContext } from 'redux-react-hook';
import { expectRedux, storeSpy } from 'expect-redux';
import { configureStore } from '../src/store';
import { Prompt } from '../src/Prompt';

describe('Prompt', () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = configureStore([storeSpy]);
  });

  function mountWithStore(component) {
    return mount(<StoreContext.Provider value={store}><table>{component}</table></StoreContext.Provider>);
  }

  it('renders a tbody', () => {
    wrapper = mountWithStore(<Prompt />);
    expect(wrapper.find('tbody').exists()).toBeTruthy();
  });

  it('renders a table cell with a prompt indicator as the first cell in each row', () => {
    wrapper = mountWithStore(<Prompt />);
    const td = wrapper.find('tr').at(0).childAt(0);
    expect(td.text()).toEqual('>');
    expect(td.hasClass('promptIndicator')).toBeTruthy();
  });

  function textArea() {
    return wrapper.find('tr').at(0).childAt(1).childAt(0);
  }

  it('renders a table cell with an empty textarea', () => {
    wrapper = mountWithStore(<Prompt />);
    expect(textArea().type()).toEqual('textarea');
    expect(textArea().prop('value')).toEqual('');
  });

  it('sets the textarea text to initially have a height of 20', () => {
    wrapper = mountWithStore(<Prompt />);
    expect(textArea().prop('style')).toEqual({ height: 20 });
  });

  it('dispatches an action with the updated edit line when the user hits enter on the text field', () => {
    const line = 'repeat 4\n[ forward 10 right 90 ]\n';
    wrapper = mountWithStore(<Prompt />);
    textArea().simulate('keypress', { key: 'Enter' });
    textArea().simulate('change', { target: { value: line } });
    return expectRedux(store)
      .toDispatchAnAction()
      .matching({ type: 'SUBMIT_EDIT_LINE', text: line });
  });

  describe('instruction id increments after submitting edit line', () => {
    beforeEach(() => {
      wrapper = mountWithStore(<Prompt />);
      textArea().simulate('keypress', { key: 'Enter' });
      textArea().simulate('change', { target: { value: 'forward 10\n' } });
      wrapper = wrapper.update();
    });

    it('blanks the edit field', () => {
      expect(textArea().prop('value')).toEqual('');
    });
  });
});
