import React from 'react';
import { mount } from 'enzyme';
import { StoreContext } from 'redux-react-hook';
import { expectRedux, storeSpy } from 'expect-redux';
import { configureStore } from '../src/store';
import { MenuButtons } from '../src/MenuButtons';

describe('MenuButtons', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = configureStore([storeSpy]);
  });

  function mountWithStore(component) {
    return mount(<StoreContext.Provider value={store}>{component}</StoreContext.Provider>);
  }

  function button(text) {
    return wrapper.find('button').findWhere(b => b.text() === text);
  }

  describe('reset button', () => {
    it('renders', () => {
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Reset').exists()).toBeTruthy();
    });

    it('is disabled initially', () => {
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Reset').prop('disabled')).toBeTruthy();
    });

    it('is enabled once a state change occurs', () => {
      store.dispatch({ type: 'SUBMIT_EDIT_LINE', text: 'forward 10\n' });
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Reset').prop('disabled')).toBeFalsy();
    });

    it('dispatches an action of RESET when clicked', () => {
      store.dispatch({ type: 'SUBMIT_EDIT_LINE', text: 'forward 10\n' });
      wrapper = mountWithStore(<MenuButtons />);
      button('Reset').simulate('click');
      expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'RESET' });
    });
  });
});
