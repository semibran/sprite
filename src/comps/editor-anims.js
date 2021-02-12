
import m from 'mithril'
import { getFrameAt, getFramesAt, getSelectedAnim } from '../app/helpers'
import AnimsCanvas from './canvas-anims'
import Timeline from './timeline'

let onkeydown = null

export default function AnimsEditor (state, dispatch) {
  const image = state.cache.image
  const tl = state.timeline
  const anim = getSelectedAnim(state)
  const selects = tl.selects
  const frame = anim && getFrameAt(anim, tl.pos)
  const frames = anim && (selects.length > 1
    ? getFramesAt(anim, selects)
    : getFramesAt(anim, [tl.pos - 1, tl.pos, tl.pos + 1])
  )

  return m.fragment({
    oncreate: () => {
      window.addEventListener('keydown', (onkeydown = (evt) => {
        let xdelta = 0
        let ydelta = 0

        if (evt.code === 'ArrowLeft') {
          xdelta = -1
        } else if (evt.code === 'ArrowRight') {
          xdelta = 1
        }

        if (evt.code === 'ArrowUp') {
          ydelta = -1
        } else if (evt.code === 'ArrowDown') {
          ydelta = 1
        }

        if (evt.shiftKey) {
          xdelta *= 10
          ydelta *= 10
        }

        if (xdelta || ydelta) {
          dispatch('moveFrameOrigin', { x: -xdelta, y: -ydelta })
        }

        evt.redraw = false
      }), true)
    },
    onremove: () => {
      window.removeEventListener('keydown', onkeydown, true)
    }
  }, m('.editor-column', [
    m('#editor.-anims', [
      state.anims.list.length
        ? m(AnimsCanvas, {
            image,
            frame,
            frames: (tl.onionskin && frames) || [],
            playing: tl.playing,
            onchangeoffset: (x, y) => dispatch('setFrameOrigin', { x, y })
          })
        : null
    ]),
    anim ? Timeline(state, dispatch) : null
  ]))
}
