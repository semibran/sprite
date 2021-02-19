
import deepClone from 'lodash.clonedeep'
import select from '../lib/select'

export const selectSprite = (state, { index, opts }) => {
  const newState = deepClone(state)
  if (state.select.focus !== 'sprites') {
    newState.panel = 'sprites'
    newState.select.focus = 'sprites'
    newState.select.list = []
  }

  select(newState.select.list, index, opts)
  return newState
}
