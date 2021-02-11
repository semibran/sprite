
import m from 'mithril'
import { getFrameAt, getFramesAt, getSelectedAnim } from '../app/helpers'

import AnimsCanvas from './canvas-anims'
import Timeline from './timeline'

export default function AnimsEditor (state, dispatch) {
  const image = state.image
  const tl = state.timeline
  const anim = getSelectedAnim(state)
  const selects = tl.selects
  const frame = anim && getFrameAt(anim, tl.pos)
  const frames = anim && (selects.length > 1
    ? getFramesAt(anim, selects)
    : getFramesAt(anim, [tl.pos - 1, tl.pos, tl.pos + 1])
  )
  return m('.editor-column', [
    m('#editor.-anims', [
      state.anims.list.length
        ? m(AnimsCanvas, {
            image,
            frame,
            frames: tl.onionskin && frames || [],
            playing: tl.playing,
            // onchangeoffset: moveFrameOrigin
          })
        : null
    ]),
    anim ? Timeline(state, dispatch) : null
  ])
}
