
import m from 'mithril'
import cc from 'classcat'

const SCALE_MIN = 1
const SCALE_MAX = 8
const SCALE_FACTOR = 0.01

export default function Editor ({ attrs }) {
  const { onrender, onclick, onmove, onpan, onzoom } = attrs
  let pos = { x: 0, y: 0 }
  let scale = 1
  let pan = null
  let click = false
  let editor = null
  let canvas = null

  const onmousedown = (evt) => {
    click = true
    pan = {
      x: evt.pageX - pos.x,
      y: evt.pageY - pos.y
    }
  }

  const onmousemove = (evt) => {
    if (pan) {
      click = false
      pos = {
        x: evt.pageX - pan.x,
        y: evt.pageY - pan.y
      }
      m.redraw()
    }
    onmove && onmove({
      x: (evt.pageX + pos.x) / scale,
      y: (evt.pageY + pos.y) / scale
    })
  }

  const onmouseup = (evt) => {
    if (click) {
      onclick && onclick({
        x: (evt.pageX + pos.x) / scale,
        y: (evt.pageY + pos.y) / scale
      })
    }
    if (pan) {
      pan = false
      onpan && onpan(pos)
    }
  }

  const onwheel = (evt) => {
    evt.preventDefault()
    const delta =  -evt.deltaY * SCALE_FACTOR
    const newScale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale + delta))
    const rect = editor.getBoundingClientRect()
    const mouseX = evt.pageX - rect.left - rect.width / 2
    const mouseY = evt.pageY - rect.top - rect.height / 2
    pos.x = -(mouseX - pos.x) / scale * newScale + mouseX
    pos.y = -(mouseY - pos.y) / scale * newScale + mouseY
    scale = newScale
    onzoom && onzoom(scale)
  }

  return {
    oncreate: (vnode) => {
      editor = vnode.dom
      canvas = vnode.dom.firstChild
      canvas.addEventListener('mousedown', onmousedown)
      window.addEventListener('mousemove', onmousemove)
      window.addEventListener('mouseup', onmouseup)
      canvas.addEventListener('wheel', onwheel)
    },
    onremove: (vnode) => {
      canvas.removeEventListener('mousedown', onmousedown)
      window.removeEventListener('mousemove', onmousemove)
      window.removeEventListener('mouseup', onmouseup)
      canvas.removeEventListener('wheel', onwheel)
    },
    onupdate: (vnode) => {
      onrender && onrender(canvas)
    },
    view: () => m('.editor', {
      class: cc({
        '-pan': pan //  && (!click || hover === -1),
        // '-hover': hover !== -1
      })
    }, [
      m('canvas', {
        style: 'transform: ' +
          `translate3d(${Math.round(pos.x)}px, ${Math.round(pos.y)}px, 0) ` +
          `scale(${scale})`
      })
    ])
  }
}
