
import handleSprites from './keybind-sprites'
import handleAnims from './keybind-anims'
import handleTimeline from './keybind-timeline'

const onkeydown = (store) => (evt) => {
  const state = store.getState()
  const dispatch = store.dispatch
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
}

export default onkeydown
