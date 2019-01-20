import React from 'react';
import { mount } from 'enzyme';
import { StoreContext } from 'redux-react-hook';
import { expectRedux, storeSpy } from 'expect-redux';
import { configureStore } from '../src/store';
import { MenuButtons } from '../src/MenuButtons';

describe('MenuButtons', () => {
  let store;
  let wrapper;

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

  describe('undo button', () => {
    it('renders', () => {
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Undo').exists()).toBeTruthy();
    });

    it('is disabled if there is no history', () => {
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Undo').prop('disabled')).toBeTruthy();
    });

    it('is enabled if an action occurs', () => {
      store.dispatch({ type: 'SUBMIT_EDIT_LINE', text: 'forward 10\n' });
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Undo').prop('disabled')).toBeFalsy();
    });

    it('dispatches an action of UNDO when clicked', () => {
      store.dispatch({ type: 'SUBMIT_EDIT_LINE', text: 'forward 10\n' });
      wrapper = mountWithStore(<MenuButtons />);
      button('Undo').simulate('click');
      expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'UNDO' });
    });
  });

  describe('redo button', () => {
    it('renders', () => {
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Redo').exists()).toBeTruthy();
    });

    it('is disabled if undo has not occurred yet', () => {
      store.dispatch({ type: 'SUBMIT_EDIT_LINE', text: 'forward 10\n' });
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Redo').prop('disabled')).toBeTruthy();
    });

    it('is enabled if an undo occurred', () => {
      store.dispatch({ type: 'SUBMIT_EDIT_LINE', text: 'forward 10\n' });
      store.dispatch({ type: 'UNDO' });
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Redo').prop('disabled')).toBeFalsy();
    });

    it('dispatches an action of REDO when clicked', () => {
      store.dispatch({ type: 'SUBMIT_EDIT_LINE', text: 'forward 10\n' });
      wrapper = mountWithStore(<MenuButtons />);
      button('Undo').simulate('click');
      button('Redo').simulate('click');
      expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'REDO' });
    });
  });

  describe('sharing button', () => {
    it('renders Start sharing by default', () => {
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Start sharing').exists()).toBeTruthy();
    });

    it('renders Stop sharing if sharing has started', () => {
      store.dispatch({ type: 'STARTED_SHARING' });
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Stop sharing').exists()).toBeTruthy();
    });

    it('renders Start sharing if sharing has stopped', () => {
      store.dispatch({ type: 'STARTED_SHARING' });
      store.dispatch({ type: 'STOPPED_SHARING' });
      wrapper = mountWithStore(<MenuButtons />);
      expect(button('Start sharing').exists()).toBeTruthy();
    });

    it('dispatches an action of START_SHARING when start sharing is clicked', () => {
      wrapper = mountWithStore(<MenuButtons />);
      button('Start sharing').simulate('click');
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'START_SHARING' });
    });

    it('dispatches an action of STOP_SHARING when stop sharing is clicked', async () => {
      store.dispatch({ type: 'STARTED_SHARING' });
      wrapper = mountWithStore(<MenuButtons />);
      button('Stop sharing').simulate('click');
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'STOP_SHARING' });
    });
  });

  describe('messages', () => {
    it('renders a message containing the url if sharing has started', () => {
      store.dispatch({ type: 'STARTED_SHARING', url: 'http://123' });
      wrapper = mountWithStore(<MenuButtons />);
      expect(wrapper.containsMatchingElement(
        <p>You are now presenting your script. <a href="http://123">Here's the URL for sharing.</a></p>)).toBeTruthy();
    });

    it('renders a message when watching has started', () => {
      store.dispatch({ type: 'STARTED_WATCHING' });
      wrapper = mountWithStore(<MenuButtons />);
      expect(wrapper.containsMatchingElement(
        <p>You are now watching the session</p>)).toBeTruthy();
    });
  });
});
