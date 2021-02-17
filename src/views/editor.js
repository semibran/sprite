
import m from 'mithril'
import cc from 'classcat'
import contains from '../lib/rect-contains'

const SCALE_MIN = 1
const SCALE_MAX = 8
const SCALE_FACTOR = 0.01

export default function Editor ({ attrs }) {
  const { onrender, onclick, onmove, onpan, onzoom } = attrs
  let pos = attrs.pos || { x: 0, y: 0 }
  let scale = attrs.scale || 1
  let pan = null
  let click = false
  let hover = false
  let editor = null
  let canvas = null

  const transformPos = (x, y) => ({
    x: (x - pos.x) / scale,
    y: (y - pos.y) / scale
  })

  const getMousePos = (x, y) => ({
    x: x - editor.offsetLeft - editor.offsetWidth / 2,
    y: y - editor.offsetTop - editor.offsetHeight / 2
  })

  const getImagePos = (x, y) => {
    const mouse = getMousePos(x, y)
    return transformPos(mouse.x, mouse.y)
  }

  const onmousedown = (evt) => {
    click = true
    pan = {
      x: evt.pageX - pos.x,
      y: evt.pageY - pos.y
    }
    m.redraw()
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
    const mouse = getImagePos(evt.pageX, evt.pageY)
    const rect = editor.getBoundingClientRect()
    if (contains(rect, evt.pageX, evt.pageY)) {
      onmove && onmove(mouse)
    }
  }

  const onmouseup = (evt) => {
    if (click) {
      const mouse = getImagePos(evt.pageX, evt.pageY)
      const rect = editor.getBoundingClientRect()
      if (contains(rect, evt.pageX, evt.pageY)) {
        onclick && onclick({
          ...mouse,
          ctrl: evt.ctrlKey || evt.metaKey,
          shift: evt.shiftKey
        })
      }
    } else if (pan) {
      onpan && onpan(pos)
    }
    pan = false
    m.redraw()
  }

  const onwheel = (evt) => {
    evt.preventDefault()
    const delta = -evt.deltaY * SCALE_FACTOR
    const newScale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale + delta))
    const mouse = getMousePos(evt.pageX, evt.pageY)
    const image = transformPos(mouse.x, mouse.y)
    pos.x = -image.x * newScale + mouse.x
    pos.y = -image.y * newScale + mouse.y
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
    onbeforeupdate: (vnode) => {
      hover = vnode.attrs.hover
    },
    onupdate: (vnode) => {
      onrender && onrender(canvas)
    },
    view: () => m('.editor', {
      class: cc({
        '-pan': pan && (!click || !hover),
        '-hover': hover
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
