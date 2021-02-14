
const thunk = ({ dispatch, getState }) => (next) => (action, payload) => {
  if (typeof action !== 'function') {
    return next(action)
  }
  const result = action(getState(), payload)
  if (typeof result === 'function') {
    result(dispatch, getState)
  } else {
    return next({ type: action.name, payload })
  }
}

export default thunk
