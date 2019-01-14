import React from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { initialState } from './parser';
const { useCallback } = React;

export const MenuButtons = () => {
  const mapState = useCallback(({ script }) => ({ script }), []);
  const { script: { present } } = useMappedState(mapState);

  const dispatch = useDispatch();

  const reset = useCallback(() => dispatch({ type: 'RESET' }));
  const canReset = present !== initialState;

  return (
    <React.Fragment>
      <button onClick={reset} disabled={!canReset}>Reset</button>
    </React.Fragment>
  );
};
