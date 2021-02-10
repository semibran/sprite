
export default function combineReducers (reducers, initialState) {
  return function reducer (state = initialState, action) {
    const reducer = reducers[action.type]
    if (reducer) {
      return reducer(state, action.payload)
    } else {
      return initialState
    }
  }
}
