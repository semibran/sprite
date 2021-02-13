
import m from 'mithril'
import cloneImage from '../lib/img-clone'
import sliceCanvas from '../lib/slice'
import cache from './cache'
import {
  getSelectedAnim,
  getSelectedFrame,
  getAnimDuration,
  getFrameAt,
  getFramesAt,
  getFrameIndex
} from './helpers'

export * from '../views/timeline'

export const useImage = (state) => {
  if (state.sprites.list.length) return state
  const canvas = cloneImage(cache.image)
  return {
    ...state,
    sprites: sliceCanvas(canvas).map((rect, i) => (
      { name: `${state.sprname}_${i}`, rect }
    ))
  }
}
