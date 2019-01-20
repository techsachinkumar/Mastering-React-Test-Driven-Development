export const defaultState = {
  promptFocusRequest: false,
  message: () => null,
  isSharing: false,
  isWatching: false,
  url: null
};

export const environmentReducer = (
  state = defaultState,
  action
) => {
  switch (action.type) {
    case 'PROMPT_FOCUS_REQUEST':
      return { ...state, promptFocusRequest: true };
    case 'PROMPT_HAS_FOCUSED':
      return { ...state, promptFocusRequest: false };
    case 'MESSAGE':
      return { ...state, message: action.message };
    case 'STARTED_SHARING':
      return { ...state, isSharing: true, url: action.url };
    case 'STOPPED_SHARING':
      return { ...state, isSharing: false };
    case 'STARTED_WATCHING':
      return { ...state, isWatching: true };
    case 'STOPPED_WATCHING':
      return { ...state, isWatching: false };
  }
  return state;
};
