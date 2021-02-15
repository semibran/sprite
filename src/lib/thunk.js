
const thunk = ({ dispatch, getState }) => (next) => (action, payload) => {
  if (typeof action === 'string') {
    return next({ type: action, payload })
  }

  if (typeof action !== 'function') {
    return next(action)
  }

  // TODO: actions are run every time regardless of return type
  // we need a way to distinguish between return types
  // use objects, strings, or promises as actions
  const result = action(getState(), payload)
  if (typeof result === 'function') {
    result(dispatch, getState)
  } else {
    return next({ type: action.name, payload })
  }
}

export default thunk
