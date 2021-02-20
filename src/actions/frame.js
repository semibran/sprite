
import deepClone from 'lodash.clonedeep'
import select from '../lib/select'
import { getSelectedFrame } from '../app/helpers'

export const setFrameDuration = (state, { duration }) => {
  const newState = deepClone(state)
  const frame = getSelectedFrame(newState)
  frame.duration = duration
  return newState
}

export const setFrameOrigin = (state, { x, y }) => {
  const newState = deepClone(state)
  const frame = getSelectedFrame(newState)
  if (x != null) frame.origin.x = x
  if (y != null) frame.origin.y = y
  return newState
}

export const selectFrame = (state, { frameid, animid, opts }) => {
  const newState = deepClone(state)
  if (state.select.focus !== 'timeline') {
    newState.panel = 'anims'
    newState.select.focus = 'timeline'
    newState.select.list = []
  }

  // prevent deselection
  const selects = newState.select.list
  if (!selects.includes(frameid)) {
    select(selects, frameid, opts)
  }

  newState.timeline.index = frameid
  newState.anims.index = animid
  return newState
}