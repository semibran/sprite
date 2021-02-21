
export const isNoneSelected = (state) =>
  !state.select.list.length

export const isSpriteSelected = (state, id) =>
  id == null
    ? state.panel === 'sprites'
    : state.panel === 'sprites' && state.select.list.includes(id)

export const getSelectedSprite = (state) => {
  const sprites = state.sprites.list
  const selects = state.select.list
  const idx = selects[selects.length - 1]
  return state.panel === 'sprites' && selects.length
    ? sprites[idx]
    : null
}

export const getSelectedSprites = (state) => {
  const sprites = state.sprites.list
  const selects = state.select.list
  return state.panel === 'sprites' && selects.length
    ? selects.map(idx => sprites[idx])
    : []
}

export const isAnimSelected = (state, id) =>
  state.panel === 'anims' && (id == null || state.anims.index === id)

export const getSelectedAnim = (state) =>
  state.panel === 'anims' ? state.anims.list[state.anims.index] : null

export const getSelectedFrame = (state) => {
  const anim = getSelectedAnim(state)
  return anim ? getFrameAt(anim, state.timeline.index) : null
}

export const isEmptyAnim = (anim) =>
  anim.frames.length === 1 && !anim.frames[0].sprite

export const getAnimDuration = (anim) =>
  anim.frames.reduce((duration, frame) => duration + frame.duration, 0)

export const getFrameAt = (anim, t) => {
  let f = 0
  let g = 0
  let frame = anim.frames[0]
  for (let i = 0; i < t; i++) {
    if (++g === frame.duration) {
      g = 0
      frame = anim.frames[++f]
      if (!frame) {
        return null
      }
    }
  }
  return anim.frames[f]
}

export const getFramesAt = (anim, ts) =>
  [...new Set(ts.map(t => getFrameAt(anim, t)).filter(x => x))]

export const getFrameIndex = (anim, frame) => {
  let f = 0
  let g = 0
  const d = getAnimDuration(anim)
  for (let i = 0; i < d; i++) {
    if (anim.frames[f] === frame) {
      return i
    }
    if (++g >= anim.frames[f].duration) {
      f++
      g = 0
    }
  }
}
