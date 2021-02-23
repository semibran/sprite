
import handleAnims from './keybind-anims'
import { setFrameOrigin } from '../actions/frame'
import { getSelectedFrame } from './helpers'

const handleTimeline = (state, dispatch) => (evt) => {
  handleAnims(state, dispatch)(evt)

  const frame = getSelectedFrame(state)
  switch (evt.code) {
    case 'ArrowLeft':
      return dispatch(setFrameOrigin, { x: frame.origin.x + 1 })
    case 'ArrowRight':
      return dispatch(setFrameOrigin, { x: frame.origin.x - 1 })
    case 'ArrowUp':
      return dispatch(setFrameOrigin, { y: frame.origin.y + 1 })
    case 'ArrowDown':
      return dispatch(setFrameOrigin, { y: frame.origin.y - 1 })
  }
}

export default handleTimeline
