
const thunk = ({ dispatch, getState }) => (next) => (action, payload) => {
  if (typeof action === 'string') {
    return next({ type: action, payload })
  }

  if (typeof action !== 'function') {
    return next(action)
  }

  if (action.toString().slice(1).startsWith('dispatch')) {
    action(dispatch, getState)
  } else {
    return next({ type: action.name, payload })
  }
}

export default thunk
