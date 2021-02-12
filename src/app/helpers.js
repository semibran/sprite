
export const getSelectedAnim = (state) =>
  state.anims.list[state.anims.selects[state.anims.selects.length - 1]]

export const getSelectedFrame = (state) =>
  getSelectedAnim(state).frames[state.timeline.selects[state.timeline.selects.length - 1]]

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
