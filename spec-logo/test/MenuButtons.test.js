import React from 'react';
import { expectRedux } from 'expect-redux';
import {
  createContainerWithStore,
  waitForCurrentQueueToFlush
} from './domManipulators';
import { MenuButtons } from '../src/MenuButtons';
import { act } from 'react-dom/test-utils';
import * as DialogModule from '../src/Dialog';

describe('MenuButtons', () => {
  let container, renderWithStore, click;

  beforeEach(() => {
    ({
      container,
      renderWithStore,
      click
    } = createContainerWithStore());
    DialogModule.Dialog = jest.fn(() => <div id="dialog" />);
  });

  const makeDialogChoice = button => {
    const lastCall =
      DialogModule.Dialog.mock.calls[
        DialogModule.Dialog.mock.calls.length - 1
      ];
    lastCall[0].onChoose(button);
  };

  const closeDialog = () =>
    act(() => {
      const lastCall =
        DialogModule.Dialog.mock.calls[
          DialogModule.Dialog.mock.calls.length - 1
        ];
      lastCall[0].onClose();
    });

  const button = text =>
    Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === text
    );

  describe('reset button', () => {
    it('renders', () => {
      renderWithStore(<MenuButtons />);
      expect(button('Reset')).not.toBeNull();
    });

    it('is disabled initially', () => {
      renderWithStore(<MenuButtons />);
      expect(
        button('Reset').hasAttribute('disabled')
      ).toBeTruthy();
    });

    it('is enabled once a state change occurs', () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({
        type: 'SUBMIT_EDIT_LINE',
        text: 'forward 10\n'
      });
      expect(button('Reset').hasAttribute('disabled')).toBeFalsy();
    });

    it('dispatches an action of RESET when clicked', () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({
        type: 'SUBMIT_EDIT_LINE',
        text: 'forward 10\n'
      });
      click(button('Reset'));
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'RESET' });
    });
  });

  describe('undo button', () => {
    it('renders', () => {
      renderWithStore(<MenuButtons />);
      expect(button('Undo')).not.toBeNull();
    });

    it('is disabled if there is no history', () => {
      renderWithStore(<MenuButtons />);
      expect(button('Undo').hasAttribute('disabled')).toBeTruthy();
    });

    it('is enabled if an action occurs', () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({
        type: 'SUBMIT_EDIT_LINE',
        text: 'forward 10\n'
      });
      expect(button('Undo').hasAttribute('disabled')).toBeFalsy();
    });

    it('dispatches an action of UNDO when clicked', () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({
        type: 'SUBMIT_EDIT_LINE',
        text: 'forward 10\n'
      });
      click(button('Undo'));
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'UNDO' });
    });
  });

  describe('redo button', () => {
    it('renders', () => {
      renderWithStore(<MenuButtons />);
      expect(button('Redo')).not.toBeNull();
    });

    it('is disabled if undo has not occurred yet', () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({
        type: 'SUBMIT_EDIT_LINE',
        text: 'forward 10\n'
      });
      expect(button('Redo').hasAttribute('disabled')).toBeTruthy();
    });

    it('is enabled if an undo occurred', () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({
        type: 'SUBMIT_EDIT_LINE',
        text: 'forward 10\n'
      });
      store.dispatch({ type: 'UNDO' });
      expect(button('Redo').hasAttribute('disabled')).toBeFalsy();
    });

    it('dispatches an action of REDO when clicked', () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({
        type: 'SUBMIT_EDIT_LINE',
        text: 'forward 10\n'
      });
      click(button('Undo'));
      click(button('Redo'));
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'REDO' });
    });
  });

  describe('sharing button', () => {
    let socketSpyFactory;
    let socketSpy;

    beforeEach(() => {
      socketSpyFactory = jest.spyOn(window, 'WebSocket');
      socketSpyFactory.mockImplementation(() => {
        socketSpy = {
          close: () => {},
          send: () => {}
        };
        return socketSpy;
      });
    });

    afterEach(() => {
      socketSpyFactory.mockReset();
    });

    it('renders Start sharing by default', () => {
      renderWithStore(<MenuButtons />);
      expect(button('Start sharing')).not.toBeNull();
    });

    it('renders Stop sharing if sharing has started', () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({ type: 'STARTED_SHARING' });
      expect(button('Stop sharing')).not.toBeNull();
    });

    it('renders Start sharing if sharing has stopped', () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({ type: 'STARTED_SHARING' });
      store.dispatch({ type: 'STOPPED_SHARING' });
      expect(button('Start sharing')).not.toBeNull();
    });

    it('dispatches an action of START_SHARING when dialog onChoose prop is invoked with reset', () => {
      const store = renderWithStore(<MenuButtons />);
      click(button('Start sharing'));

      makeDialogChoice('reset');

      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'START_SHARING', reset: true });
    });

    it('dispatches an action of START_SHARING when dialog onChoose prop is invoked with share', () => {
      const store = renderWithStore(<MenuButtons />);
      click(button('Start sharing'));

      makeDialogChoice('share');

      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'START_SHARING', reset: false });
    });

    it('opens a dialog when start sharing is clicked', () => {
      renderWithStore(<MenuButtons />);
      click(button('Start sharing'));
      expect(DialogModule.Dialog).toHaveBeenCalled();
      const dialogProps = DialogModule.Dialog.mock.calls[0][0];
      expect(dialogProps.message).toEqual(
        'Do you want to share your previous commands, or would you like to reset to a blank script?'
      );
    });

    it('does not initially show the dialog', () => {
      renderWithStore(<MenuButtons />);
      expect(DialogModule.Dialog).not.toHaveBeenCalled();
    });

    it('passes Share and Reset buttons to the dialog', () => {
      renderWithStore(<MenuButtons />);
      click(button('Start sharing'));
      const dialogProps = DialogModule.Dialog.mock.calls[0][0];
      expect(dialogProps.buttons).toEqual([
        { id: 'keep', text: 'Share previous' },
        { id: 'reset', text: 'Reset' }
      ]);
    });

    it('closes the dialog when the onClose prop is called', () => {
      renderWithStore(<MenuButtons />);
      click(button('Start sharing'));
      closeDialog();
      expect(container.querySelector('#dialog')).toBeNull();
    });

    const notifySocketOpened = () => {
      socketSpy.onopen();
      return waitForCurrentQueueToFlush();
    };

    it('dispatches an action of STOP_SHARING when stop sharing is clicked', async () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({ type: 'START_SHARING' });
      await notifySocketOpened();
      store.dispatch({ type: 'STARTED_SHARING' });
      click(button('Stop sharing'));
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'STOP_SHARING' });
    });
  });

  describe('messages', () => {
    it('renders a message containing the url if sharing has started', () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({
        type: 'STARTED_SHARING',
        url: 'http://123'
      });
      expect(container.innerHTML).toContain(
        'You are now presenting your script. <a href="http://123">Here\'s the URL for sharing.</a></p>'
      );
    });

    it('renders a message when watching has started', () => {
      const store = renderWithStore(<MenuButtons />);
      store.dispatch({ type: 'STARTED_WATCHING' });
      expect(container.innerHTML).toContain(
        '<p>You are now watching the session</p>'
      );
    });
  });
});
