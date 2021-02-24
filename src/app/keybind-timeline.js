
import handleAnims from './keybind-anims'
import { setFrameOrigin } from '../actions/frame'
import { getSelectedFrame } from './helpers'

const handleTimeline = (state, dispatch) => (evt) => {
  handleAnims(state, dispatch)(evt)

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
