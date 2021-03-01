
import handleAnims from './keybind-anims'
import { getSelectedFrame } from './helpers'
import {
  selectAllFrames,
  setFrameOrigin
} from '../actions/frame'

const handleTimeline = (state, dispatch) => (evt) => {
  handleAnims(state, dispatch)(evt)

  const ctrl = evt.ctrlKey || evt.metaKey
  if (evt.code === 'KeyA' && ctrl) {
    return dispatch(selectAllFrames)
  }

  const delta = evt.shiftKey ? 10 : 1
  const frame = getSelectedFrame(state)
  switch (evt.code) {
    case 'ArrowLeft':
      return dispatch(setFrameOrigin, { x: frame.origin.x + delta })
    case 'ArrowRight':
      return dispatch(setFrameOrigin, { x: frame.origin.x - delta })
    case 'ArrowUp':
      return dispatch(setFrameOrigin, { y: frame.origin.y + delta })
    case 'ArrowDown':
      return dispatch(setFrameOrigin, { y: frame.origin.y - delta })
  }
}

export default handleTimeline
