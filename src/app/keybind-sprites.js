
import { selectAllSprites } from '../actions/sprite'

const handleSprites = (state, dispatch) => (evt) => {
  const ctrl = evt.ctrlKey || evt.metaKey
  if (ctrl && evt.code === 'KeyA') {
    evt.preventDefault()
    return dispatch(selectAllSprites)
  }
}

export default handleSprites
