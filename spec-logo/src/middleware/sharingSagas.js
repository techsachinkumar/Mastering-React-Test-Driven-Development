import { call, put, takeEvery, takeLatest, take } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';

function receiveMessage(socket) {
  return new Promise((resolve, reject) => {
    socket.onmessage = evt => { resolve(evt.data) };
  });
}

function openWebSocket() {
  const { host } = window.location;
  const socket = new WebSocket(`ws://${host}/share`);
  return new Promise((resolve, reject) => {
    socket.onopen = _ => { resolve(socket) };
  });
}

function webSocketListener(socket) {
  return eventChannel(emitter => {
    socket.onmessage = emitter;
    socket.onclose = _ => emitter(END);
    return () => {
      socket.onmessage = undefined;
      socket.onclose = undefined;
    };
  });
}

function buildUrl(id) {
  const { protocol, host, pathname } = window.location;
  return `${protocol}//${host}${pathname}?watching=${id}`;
}

let presenterSocket;

function* startSharing() {
  presenterSocket = yield openWebSocket();
  presenterSocket.send(JSON.stringify({ type: 'START_SHARING' }));
  const message = yield receiveMessage(presenterSocket);
  const presenterSessionId = JSON.parse(message).id;
  yield put({ type: 'STARTED_SHARING', url: buildUrl(presenterSessionId) });
}

function* stopSharing() {
  presenterSocket.close();
  yield put({ type: 'STOPPED_SHARING' });
}

function* shareNewAction({ innerAction } ) {
  if (presenterSocket && presenterSocket.readyState === 1) {
    presenterSocket.send(JSON.stringify({ type: 'NEW_ACTION', innerAction }));
  }
}

function* startWatching() {
  const sessionId = new URLSearchParams(location.search.substring(1)).get('watching');

  if (sessionId) {
    const watcherSocket = yield openWebSocket();
    yield put({ type: 'RESET' });
    watcherSocket.send(JSON.stringify({ type: 'START_WATCHING', id: sessionId }));
    yield put({ type: 'STARTED_WATCHING' });
    const chan = yield call(webSocketListener, watcherSocket);
    try {
      while (true) {
        let evt = yield take(chan);
        yield put(JSON.parse(evt.data));
      }
    } finally {
      yield put({ type: 'STOPPED_WATCHING' });
    }
  }
}

export function* sharingSaga() {
  yield takeLatest('TRY_START_WATCHING', startWatching);
  yield takeLatest('START_SHARING', startSharing);
  yield takeLatest('STOP_SHARING', stopSharing);
  yield takeLatest('SHARE_NEW_ACTION', shareNewAction);
}

export const duplicateForSharing = store => next => action => {
  if (action.type === 'SUBMIT_EDIT_LINE') {
    store.dispatch({ type: 'SHARE_NEW_ACTION', innerAction: action });
  }
  return next(action);
};
