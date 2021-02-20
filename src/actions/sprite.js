
import deepClone from 'lodash.clonedeep'
import extractImage from 'img-extract'
import sliceImage from '../lib/slice'
import mergeRects from '../lib/merge'
import select from '../lib/select'
import pack from '../lib/pack'
import cache from '../app/cache'
import { getSelectedSprites } from '../app/helpers'

export const selectSprite = (state, { index, opts }) => {
  const newState = deepClone(state)
  if (state.select.focus !== 'sprites') {
    newState.panel = 'sprites'
    newState.select.focus = 'sprites'
    newState.select.list = []
  }

  select(newState.select.list, index, opts)
  return newState
}

export const mergeSprites = (state) => {
  if (getSelectedSprites(state).length < 2) {
    return state
  }

  const newState = deepClone(state)
  const sprites = newState.sprites.list
  const selects = newState.select.list.sort()
  const rects = selects.map(idx => sprites[idx].rect)
  const rect = mergeRects(rects)
  for (let i = selects.length; --i;) {
    const idx = selects[i]
    sprites.splice(idx, 1)
    cache.sprites.splice(idx, 1)
  }

  const idx = selects[0]
  const sprite = sprites[idx]
  sprite.rect = rect
  cache.sprites[idx] = extractImage(cache.image, rect.x, rect.y, rect.width, rect.height)
  selects.length = 0
  newState.select.list = [idx]
  return newState
}

export const splitSprite = (state) => {
  if (getSelectedSprites(state).length !== 1) {
    return state
  }

  const newState = deepClone(state)
  const id = state.select.list[0]
  const offset = state.sprites.list[id].rect
  const image = cache.sprites[id]
  const rects = sliceImage(image).map(({ x, y, width, height }) => ({
    x: x + offset.x,
    y: y + offset.y,
    width,
    height
  }))

  if (rects.length === 1) {
    return state
  }

  const images = rects.map(({ x, y, width, height }) =>
    extractImage(cache.image, x, y, width, height))
  cache.sprites.splice(id, 1, ...images)

  newState.sprites.list.splice(id, 1)

  const used = []
  const sprites = rects.map((rect) => ({
    rect,
    name: (() => {
      const projid = state.project.name.toLowerCase()
      let i = 0
      while (used.includes(i) ||
             newState.sprites.list.find((sprite) => sprite.name === `${projid}_${i}`)) {
        i++
      }
      used.push(i)
      return `${projid}_${i}`
    })()
  }))

  newState.sprites.list.splice(id, 0, ...sprites)

  newState.anims.list.forEach((anim) => {
    anim.frames.forEach((frame) => {
      frame.sprite += sprites.length
    })
  })

  newState.select.list = new Array(sprites.length).fill(0).map((_, i) => id + i)

  return newState
}

export const repackSprites = (state) => {
  const newState = deepClone(state)
  const rects = state.sprites.list.map((sprite) => sprite.rect)
  const layout = pack(rects)

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = layout.width
  canvas.height = layout.height
  layout.rects.forEach((rect, i) => {
    const sprite = newState.sprites.list[i]
    const image = cache.sprites[i]
    context.drawImage(image, rect.x, rect.y)
    sprite.rect = rect
  })

  state.select.list = []
  cache.image = canvas
  cache.messages.focus = { sprite: state.sprites.list[0] }
  return newState
}
