
import handleAnims from './keybind-anims'

const handleSprites = (state, dispatch) => (evt) => {
  // editor controls
}

const handleTimeline = (state, dispatch) => (evt) => {
  // nudge controls
}

const onkeydown = (store) => (evt) => {
  const state = store.getState()
  const dispatch = store.dispatch

  const handler = ((focus) => {
    switch (focus) {
      case 'sprites':
        return handleSprites
      case 'anims':
        return handleAnims
      case 'timeline':
        return handleTimeline
    }
  })(state.select.focus)

  if (handler) {
    handler(state, dispatch)(evt)
  }
}

export default onkeydown
