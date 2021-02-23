
import { togglePlay, prevFrame, nextFrame } from '../actions/anim'

const handleAnims = (state, dispatch) => (evt) => {
  if (evt.code === 'Space') {
    dispatch(togglePlay)
  } else if (evt.code === 'Comma') {
    dispatch(prevFrame)
  } else if (evt.code === 'Period') {
    dispatch(nextFrame)
  }
}

export default handleAnims
