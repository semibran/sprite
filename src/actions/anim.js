
import deepClone from 'lodash.clonedeep'
import select from '../lib/select'

export const createAnim = (state, { ids }) => ({
  ...state,
  select: {
    focus: 'anims',
    list: [state.anims.list.length]
  },
  anims: {
    ...state.anims,
    list: [...state.anims.list, {
      name: 'untitled',
      next: null,
      speed: 1,
      frames: ids
        ? ids.map((id) => {
            const sprite = state.sprites.list[id]
            const rect = sprite.rect
            const x = Math.round(rect.width / 2)
            const y = rect.height
            return {
              sprite: id,
              duration: 1,
              origin: { x, y }
            }
          })
        : []
    }]
  }
})

export const removeAnim = (state, { index }) => ({
  ...state,
  anims: state.anims.list.filter((_, i) => i !== index)
})

export const selectAnim = (state, { index, opts }) => {
  const newState = deepClone(state)
  if (state.select.focus !== 'anims') {
    newState.panel = 'anims'
    newState.select.focus = 'anims'
    newState.select.list = []
  }

  // prevent deselection
  const selects = newState.select.list
  if (!selects.includes(index)) {
    select(selects, index, opts)
    newState.anims.index = index
  }

  return newState
}
