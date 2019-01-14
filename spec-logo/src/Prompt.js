import React from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
const { useState, useCallback } = React;

export const Prompt = () => {
  const mapState = useCallback(({
    script: { nextInstructionId } }) => ({ nextInstructionId }), []);

  const { nextInstructionId } = useMappedState(mapState);

  const dispatch = useDispatch();
  const submitEditLine = useCallback(text => {
    dispatch({ type: 'SUBMIT_EDIT_LINE', text });
  }
  );

  const handleKeyPress = useCallback(e => {
    if (e.key === 'Enter') {
      setShouldSubmit(true);
    }
  });

  const handleChange = useCallback(e => {
    setEditPrompt(e.target.value);
    if(shouldSubmit) {
      submitEditLine(e.target.value);
      setShouldSubmit(false);
    }
  });

  const handleScroll = useCallback(e => setHeight(e.target.scrollHeight));

  const [ editPrompt, setEditPrompt ] = useState('');
  const [ shouldSubmit, setShouldSubmit ] = useState(false);

  const [ currentInstructionId, setCurrentInstructionId ] = useState(nextInstructionId);

  const [ height, setHeight ] = useState(20);

  if (currentInstructionId != nextInstructionId) {
    setCurrentInstructionId(nextInstructionId);
    setEditPrompt('');
    setHeight(20);
  }

  return (
    <tbody key="prompt">
    <tr>
      <td className="promptIndicator">&gt;</td>
    <td>
      <textarea onScroll={handleScroll}
                value={editPrompt}
                style={{height: height}}
                onChange={handleChange}
                onKeyPress={handleKeyPress} />
    </td>
    </tr>
    </tbody>
  );
};
