import React from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { initialState } from './parser';
const { useCallback } = React;

function SharingUrl({ url }) {
  return <p>You are now presenting your script. <a href={url}>Here's the URL for sharing.</a></p>;
}

export const MenuButtons = () => {
  const mapState = useCallback(({ script, environment }) => ({ script, environment }), []);
  const { script: { past, present, future }, environment } = useMappedState(mapState);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;
  const canReset = present !== initialState;

  const dispatch = useDispatch();
  const undo = useCallback(() => dispatch({ type: 'UNDO' }));
  const redo = useCallback(() => dispatch({ type: 'REDO' }));
  const reset = useCallback(() => dispatch({ type: 'RESET' }));
  const startSharing = useCallback(() => dispatch({ type: 'START_SHARING' }));
  const stopSharing = useCallback(() => dispatch({ type: 'STOP_SHARING' }));

  return (
    <React.Fragment>
      {environment.isSharing ? <SharingUrl url={environment.url} /> : null}
      {environment.isWatching ? <p>You are now watching the session</p> : null}
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
      <button onClick={reset} disabled={!canReset}>Reset</button>
      {environment.isSharing ?
        <button id="stopSharing" onClick={stopSharing}>Stop sharing</button> :
        <button id="startSharing" onClick={startSharing}>Start sharing</button>}
    </React.Fragment>
  );
};
