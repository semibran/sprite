
import deepClone from 'lodash.clonedeep'
import select from '../lib/select'
import {
  getSelectedAnim,
  getSelectedFrame,
  getFrameAt,
  getFrameIndex
} from '../app/helpers'

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

  select(newState.select.list, frameid, opts)
  if (!newState.select.list.length) {
    newState.select.focus = 'anims'
    newState.select.list = [animid]
  }

  const anim = newState.anims.list[animid]
  const frame = anim.frames[frameid]
  newState.timeline.index = getFrameIndex(anim, frame)
  newState.anims.index = animid
  return newState
}

export const deleteFrame = (state) => {
  const newState = deepClone(state)
  const anim = getSelectedAnim(newState)
  const frame = getFrameAt(anim, newState.timeline.index)
  const index = anim.frames.indexOf(frame)
  anim.frames.splice(index, 1)
  return newState
}
