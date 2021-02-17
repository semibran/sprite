
export const isSpriteSelected = (select, id) =>
  id == null
    ? select.target === 'sprites'
    : select.target === 'sprites' && select.items.includes(id)

export const isAnimSelected = (select, id) =>
  id == null
    ? select.target === 'anims'
    : select.target === 'anims' && select.items.includes(id)

export const getSelectedSprite = (state) =>
  state.select.target === 'sprites' && state.select.items.length
    ? state.sprites[state.select.items[state.select.items.length - 1]]
    : null

export const getSelectedAnim = (state) =>
  state.select.target === 'anims' &&
  state.anims[state.select.items[state.select.items.length - 1]]

export const getSelectedFrame = (state) =>
  getFrameAt(getSelectedAnim(state), state.timeline.selects[state.timeline.selects.length - 1])

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
