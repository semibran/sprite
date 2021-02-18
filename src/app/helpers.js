
export const isNoneSelected = (state) =>
  state.focus === 'sprites' && !state.sprites.selects.length ||
  state.focus === 'anims' && !state.anims.selects.length ||
  state.focus === 'timeline' && !state.timeline.selects.length

export const isSpriteSelected = (state, id) =>
  id == null
    ? state.focus === 'sprites'
    : state.focus === 'sprites' && state.sprites.selects.includes(id)

export const isAnimSelected = (state, id) =>
  id == null
    ? state.focus === 'anims'
    : state.focus === 'anims' && state.anims.selects.includes(id)

export const getSelectedSprite = (state) => {
  const sprites = state.sprites.list
  const selects = state.sprites.selects
  const idx = selects[selects.length - 1]
  return state.focus === 'sprites' && selects.length
    ? sprites[idx]
    : null
}

export const getSelectedSprites = (state) => {
  const sprites = state.sprites.list
  const selects = state.sprites.selects
  return state.focus === 'sprites' && selects.length
    ? selects.map(idx => sprites[idx])
    : []
}

export const getSelectedAnim = (state) => {
  const anims = state.anims.list
  const selects = state.anims.selects
  const idx = selects[selects.length - 1]
  return (state.focus === 'anims' || state.focus === 'timeline') && selects.length
    ? anims[selects[selects.length - 1]]
    : null
}

export const getSelectedFrame = (state) => {
  const anim = getSelectedAnim(state)
  const framenum = state.timeline.pos
  return anim
    ? getFrameAt(anim, framenum)
    : null
}

export const isEmptyAnim = (anim) =>
  anim.frames.length === 1 && !anim.frames[0].sprite

export const getAnimDuration = (anim) =>
  anim.frames.reduce((d, frame) => d + frame.duration, 0)

export const getFrameAt = (anim, t) => {
  let f = 0
  let g = 0
  let frame = anim.frames[0]
  for (let i = 0; i < t; i++) {
    if (++g >= frame.duration) {
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
