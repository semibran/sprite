
export const getSelectedAnim = (state) => {
  return state.anims.list[state.anims.selects[state.anims.selects.length - 1]]
}

export const getAnimDuration = (anim) => {
  return anim.frames.reduce((d, frame) => d + frame.duration, 0)
}

export const getFrameAt = (anim, t) => {
  if (t >= anim.frames.length) {
    return null
  }
  let f = 0
  let g = 0
  let frame = anim.frames[0]
  for (let i = 0; i < t; i++) {
    if (++g >= frame.duration) {
      frame = anim.frames[++f]
      g = 0
      if (!frame) {
        return null
      }
    }
  }
  return anim.frames[f]
}

export const getFramesAt = (anim, ts) =>
  [...new Set(ts.map(t => getFrameAt(anim, t)).filter(x => x))]

export const getIndexOfFrame = (anim, frame) => {
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
