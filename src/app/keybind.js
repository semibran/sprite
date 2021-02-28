
import handleSprites from './keybind-sprites'
import handleAnims from './keybind-anims'
import handleTimeline from './keybind-timeline'
import { shift, unshift } from '../actions'

export const onkeydown = ({ getState, dispatch }) => (evt) => {
  const state = getState()

  const handler = ((focus) => {
    switch (focus) {
      case 'sprites': return handleSprites
      case 'anims': return handleAnims
      case 'timeline': return handleTimeline
    }
  })(state.select.focus)

  if (handler) {
    handler(state, dispatch)(evt)
  }

  if (evt.key === 'Shift') {
    dispatch(shift)
  }
}

export const onkeyup = ({ getState, dispatch }) => (evt) => {
  if (evt.key === 'Shift') {
    dispatch(unshift)
  }
}
