import { storeSpy, expectRedux } from 'expect-redux';
import { configureStore } from '../../src/store';
import { duplicateForSharing, sharingSaga } from '../../src/middleware/sharingSagas';

describe('duplicateForSharing', () => {
  let dispatch;
  let store;
  let next;

  beforeEach(() => {
    dispatch = jest.fn();
    store = { dispatch };
    next = jest.fn();
  });

  function callMiddleware(action) {
    return duplicateForSharing(store)(next)(action);
  }

  it('calls next with the action', () => {
    const action = { a: 123 };
    callMiddleware(action);
    expect(next).toHaveBeenCalledWith(action);
  });

  it('returns the result of the next action', () => {
    next.mockReturnValue({ a: 123 });
    expect(callMiddleware({})).toEqual({ a: 123 });
  });

  it('dispatches a new SHARE_NEW_ACTION action if the action is of type SUBMIT_EDIT_LINE', () => {
    const action = { type: 'SUBMIT_EDIT_LINE', text: 'abc' };
    callMiddleware(action);
    expect(dispatch).toHaveBeenCalledWith({ type: 'SHARE_NEW_ACTION', innerAction: action });
  });

  it('does not dispatch a SHARE_NEW_ACTION action if the action is not of type SUBMIT_EDIT_LINE', () => {
    const action = { type: 'UNKNOWN' };
    callMiddleware(action);
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe('sharingSaga', () => {
  let store;
  let socketSpyFactory;
  let socketSpy;
  let sendSpy;
  let closeSpy;

  beforeEach(() => {
    sendSpy = jest.fn();
    closeSpy = jest.fn();
    socketSpyFactory = jest.fn(url => {
      socketSpy = {
        send: sendSpy,
        close: closeSpy,
        readyState: 1
      };
      return socketSpy;
    });
    store = configureStore([storeSpy]);
    window.WebSocket = socketSpyFactory;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        protocol: 'http:',
        host: 'test:1234',
        pathname: '/index.html'
      }
    });
  });

  function notifySocketOpened() {
    socketSpy.onopen();
    return new Promise(setTimeout);
  };

  describe('START_SHARING', () => {
    it('opens a websocket when starting to share', async () => {
      store.dispatch({ type: 'START_SHARING' });
      await new Promise(setTimeout);
      expect(socketSpyFactory).toHaveBeenCalledWith('ws://test:1234/share');
    });

    it('sends a START_SHARING message to the socket', async () => {
      store.dispatch({ type: 'START_SHARING' });
      await notifySocketOpened();
      expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({ type: 'START_SHARING' }));
    });

    it('puts an action of STARTED_SHARING with a URL containing the id that is returned from the server', async () => {
      store.dispatch({ type: 'START_SHARING' });
      await notifySocketOpened();
      socketSpy.onmessage({ data: JSON.stringify({ type: 'UNKNOWN', id: 123 }) });
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'STARTED_SHARING', url: 'http://test:1234/index.html?watching=123' });
    });
  });

  async function startSharing(sessionId) {
    store.dispatch({ type: 'START_SHARING' });
    await notifySocketOpened();
    socketSpy.onmessage({ data: JSON.stringify({ type: 'UNKNOWN', id: 123 }) });
  }

  describe('STOP_SHARING', () => {
    it('calls close on the open socket', async () => {
      startSharing();
      await new Promise(setTimeout);
      store.dispatch({ type: 'STOP_SHARING' });
      expect(closeSpy).toHaveBeenCalled();
    });

    it('puts an action of STOPPED_SHARING', () => {
      startSharing();
      store.dispatch({ type: 'STOP_SHARING' });
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'STOPPED_SHARING' });
    });
  });

  describe('SHARE_NEW_ACTION', () => {
    it('forwards the same action on to the socket', async () => {
      const innerAction = { a: 123 };
      startSharing(123);
      await new Promise(setTimeout);
      store.dispatch({ type: 'SHARE_NEW_ACTION', innerAction });
      expect(sendSpy).toHaveBeenLastCalledWith(JSON.stringify({ type: 'NEW_ACTION', innerAction }));
    });

    it('does not forward if the socket is not set yet', async () => {
      store.dispatch({ type: 'SHARE_NEW_ACTION' });
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('does not forward if the socket has been closed', async () => {
      startSharing(123);
      await new Promise(setTimeout);
      socketSpy.readyState = 3;
      store.dispatch({ type: 'SHARE_NEW_ACTION' });
      expect(sendSpy.mock.calls.length).toEqual(1);
    });
  });

  describe('watching', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          host: 'test:1234',
          pathanme: '/index.html',
          search: '?watching=234'
        }
      });
    });

    it('opens a socket when the page loads', () => {
      store.dispatch({ type: 'TRY_START_WATCHING' });
      expect(socketSpyFactory).toHaveBeenCalledWith('ws://test:1234/share');
    });

    it('does not open socket if the watching field is not set', () => {
      window.location.search = '?';
      store.dispatch({ type: 'TRY_START_WATCHING' });
      expect(socketSpyFactory).not.toHaveBeenCalled();
    });

    function startWatching() {
      store.dispatch({ type: 'TRY_START_WATCHING' });
      socketSpy.onopen();
    }

    function sendJsonMessage(obj) {
      socketSpy.onmessage({ data: JSON.stringify(obj) });
    }

    it('sends a RESET action', () => {
      startWatching();
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'RESET' });
    });

    it('sends the session id to the socket with a message type of START_WATCHING', async () => {
      startWatching();
      await new Promise(setTimeout);
      expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({ type: 'START_WATCHING', id: '234' }));
    });

    it('puts a STARTED_WATCHING actions', () => {
      startWatching();
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'STARTED_WATCHING' });
    });

    it('relays multiple actions from the websocket', async () => {
      const message1 = { type: 'ABC' };
      const message2 = { type: 'BCD' };
      const message3 = { type: 'CDE' };
      startWatching();
      await new Promise(setTimeout);
      socketSpy.onmessage({ data: JSON.stringify(message1) });
      socketSpy.onmessage({ data: JSON.stringify(message2) });
      socketSpy.onmessage({ data: JSON.stringify(message3) });

      await expectRedux(store).toDispatchAnAction().matching(message1);
      await expectRedux(store).toDispatchAnAction().matching(message2);
      await expectRedux(store).toDispatchAnAction().matching(message3);
      socketSpy.onclose();
      await new Promise(setTimeout);
    });

    it('sends a STOPPED_WATCHING action when the connection is closed', async () => {
      startWatching();
      await new Promise(setTimeout);
      socketSpy.onclose();

      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: 'STOPPED_WATCHING' });
    });
  });
});
