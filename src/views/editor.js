
import m from 'mithril'
import cc from 'classcat'
import cssify from 'css-string'
import contains from '../lib/rect-contains'

const ZOOM_MIN = 1
const ZOOM_MAX = 8
const ZOOM_FACTOR = 0.01
const ZOOM_DEBOUNCE = 250
const FLY_SPEED = 6

export default function Editor ({ attrs }) {
  let onrender = attrs.onrender
  let onclick = attrs.onclick
  let onmove = attrs.onmove
  let onpan = attrs.onpan
  let onzoom = attrs.onzoom
  let pos = attrs.pos || { x: 0, y: 0 }
  let scale = attrs.scale || 1
  let pan = null
  let click = null
  let hover = false
  let target = null
  let animating = false
  let zoomTimeout = null
  let editor = null
  let canvas = null

  const transformPos = (x, y, _scale = scale) => ({
    x: (x - pos.x) / _scale,
    y: (y - pos.y) / _scale
  })

  const getMousePos = (x, y) => ({
    x: x - editor.offsetLeft - editor.offsetWidth / 2,
    y: y - editor.offsetTop - editor.offsetHeight / 2
  })

  const getImagePos = (x, y) => {
    const mouse = getMousePos(x, y)
    return transformPos(mouse.x, mouse.y)
  }

  const flyTo = (_target) => {
    target = _target
    requestAnimationFrame(function animate () {
      if (target !== _target) {
        return // a different target was clicked during animation
      }
      const xdist = target.x - pos.x
      const ydist = target.y - pos.y
      if (Math.abs(xdist) + Math.abs(ydist) < 1) {
        pos.x += xdist
        pos.y += ydist
        m.redraw()
      } else {
        pos.x += xdist / FLY_SPEED
        pos.y += ydist / FLY_SPEED
        m.redraw()
        requestAnimationFrame(animate)
      }
    })
  }

  const onmousedown = (evt) => {
    if (animating) return
    click = {
      x: evt.pageX,
      y: evt.pageY
    }
    pan = {
      x: evt.pageX - pos.x,
      y: evt.pageY - pos.y
    }
    m.redraw()
  }

  const onmousemove = (evt) => {
    if (click &&
        Math.abs(evt.pageX - click.x) +
        Math.abs(evt.pageY - click.y) > 2) {
      click = null
    }
    if (pan) {
      pos = {
        x: evt.pageX - pan.x,
        y: evt.pageY - pan.y
      }
      m.redraw()
    }
    const mouse = getImagePos(evt.pageX, evt.pageY)
    const rect = editor.getBoundingClientRect()
    const contained = contains(rect, evt.pageX, evt.pageY)
    onmove && onmove({ ...mouse, contained })
  }

  const onmouseup = (evt) => {
    if (animating) return
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
    if (animating) return
    evt.preventDefault()
    const delta = -evt.deltaY * ZOOM_FACTOR
    const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale + delta))
    if (scale - newScale === 0) {
      return
    }

    const mouse = getMousePos(evt.pageX, evt.pageY)
    const image = transformPos(mouse.x, mouse.y)
    pos.x = -image.x * newScale + mouse.x
    pos.y = -image.y * newScale + mouse.y
    scale = newScale
    m.redraw()

    zoomTimeout && clearTimeout(zoomTimeout)
    zoomTimeout = setTimeout(() => onzoomend(evt), ZOOM_DEBOUNCE)
  }

  const adjustScale = (scale) => {
    return Math.round(scale)
  }

  const onzoomend = (evt) => {
    const newScale = adjustScale(scale)
    if (scale !== newScale) {
      const mouse = getMousePos(evt.pageX, evt.pageY)
      const image = transformPos(mouse.x, mouse.y)
      pos.x = -image.x * newScale + mouse.x
      pos.y = -image.y * newScale + mouse.y
      scale = newScale
      animating = true
      canvas.addEventListener('transitionend', ontransitionend)
    }
    onpan && onpan(pos)
    onzoom && onzoom(scale)
  }

  const ontransitionend = (evt) => {
    animating = false
    canvas.removeEventListener('transitionend', ontransitionend)
    m.redraw()
  }

  return {
    oncreate: (vnode) => {
      editor = vnode.dom
      canvas = vnode.dom.firstChild
      vnode.state.editor = editor
      vnode.state.canvas = canvas
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
    onbeforeupdate: ({ attrs }) => {
      attrs.pos && flyTo(attrs.pos)
      scale = attrs.scale || scale
      hover = attrs.hover || false
      onrender = attrs.onrender
      onclick = attrs.onclick
      onmove = attrs.onmove
      onpan = attrs.onpan
      onzoom = attrs.onzoom
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
        class: cc({ '-adjust': animating }),
        style: cssify({
          transform: `translate3d(${Math.round(pos.x)}px, ${Math.round(pos.y)}px, 0)` +
                      `scale(${scale})`
        })
      })
    ])
  }
}
