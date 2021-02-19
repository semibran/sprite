
import m from 'mithril'
import cc from 'classcat'
import lerp from 'lerp'
import contains from '../lib/rect-contains'
import createAnim from '../lib/anim'
import { easeInOut } from '../lib/ease-expo'

const ZOOM_MIN = 1
const ZOOM_MAX = 8
const ZOOM_FACTOR = 0.01
const ZOOM_DEBOUNCE = 125
const FLY_SPEED = 6
const ANIM_DURATION = 15

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
  let anim = null
  let zooming = false
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
    ontransitionstart(_target.x, _target.y, scale)
    // target = _target
    // requestAnimationFrame(function animate () {
    //   if (target !== _target) {
    //     return // a different target was clicked during animation
    //   }
    //   const xdist = target.x - pos.x
    //   const ydist = target.y - pos.y
    //   if (Math.abs(xdist) + Math.abs(ydist) < 1) {
    //     pos.x += xdist
    //     pos.y += ydist
    //     m.redraw()
    //   } else {
    //     pos.x += xdist / FLY_SPEED
    //     pos.y += ydist / FLY_SPEED
    //     m.redraw()
    //     requestAnimationFrame(animate)
    //   }
    // })
  }

  const onmousedown = (evt) => {
    if (anim) return
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
    if (anim) return
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
      if (zooming) {
        zoomTimeout && clearTimeout(zoomTimeout)
        zoomTimeout = setTimeout(() => onzoomend(evt), ZOOM_DEBOUNCE)
      }
    }
    pan = false
    m.redraw()
  }

  const onwheel = (evt) => {
    if (anim) return
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

    zooming = true
    zoomTimeout && clearTimeout(zoomTimeout)
    zoomTimeout = setTimeout(() => onzoomend(evt), ZOOM_DEBOUNCE)
  }

  const adjustScale = (scale) => {
    return Math.round(scale)
  }

  const onzoomend = (evt) => {
    if (pan) return
    const newScale = adjustScale(scale)
    if (scale !== newScale) {
      const mouse = getMousePos(evt.pageX, evt.pageY)
      const image = transformPos(mouse.x, mouse.y)
      const newX = -image.x * newScale + mouse.x
      const newY = -image.y * newScale + mouse.y
      ontransitionstart(newX, newY, newScale)
    }
    onpan && onpan(pos)
    onzoom && onzoom(scale)
    m.redraw()
  }

  const ontransitionstart = (newX, newY, newScale) => {
    anim = createAnim(ANIM_DURATION)
    const oldX = pos.x
    const oldY = pos.y
    const oldScale = scale
    requestAnimationFrame(function animate () {
      const p = anim()
      if (p === -1) {
        ontransitionend()
      } else {
        const t = easeInOut(p)
        pos.x = lerp(oldX, newX, t)
        pos.y = lerp(oldY, newY, t)
        scale = lerp(oldScale, newScale, t)
        m.redraw()
        requestAnimationFrame(animate)
      }
    })
  }

  const ontransitionend = () => {
    zooming = false
    anim = null
  }

  return {
    oncreate: (vnode) => {
      editor = vnode.dom
      canvas = vnode.dom.firstChild.firstChild
      vnode.state.editor = editor
      vnode.state.canvas = canvas
      vnode.state.pos = pos
      vnode.state.scale = scale
      canvas.addEventListener('mousedown', onmousedown)
      window.addEventListener('mousemove', onmousemove)
      window.addEventListener('mouseup', onmouseup)
      canvas.addEventListener('wheel', onwheel)
      onrender && onrender(vnode)
    },
    onremove: (vnode) => {
      canvas.removeEventListener('mousedown', onmousedown)
      window.removeEventListener('mousemove', onmousemove)
      window.removeEventListener('mouseup', onmouseup)
      canvas.removeEventListener('wheel', onwheel)
    },
    onbeforeupdate: ({ attrs, state }) => {
      attrs.pos && flyTo(attrs.pos)
      scale = attrs.scale || scale
      hover = attrs.hover || false
      onrender = attrs.onrender
      onclick = attrs.onclick
      onmove = attrs.onmove
      onpan = attrs.onpan
      onzoom = attrs.onzoom
      state.pos = pos
      state.scale = scale
    },
    onupdate: (vnode) => {
      onrender && onrender(vnode)
    },
    view: (vnode) => m('.editor', {
      class: cc([vnode.attrs.class, {
        '-pan': pan && (!click || !hover),
        '-hover': hover
      }])
    }, [
      m('.canvas-wrap', [
        m('canvas'),
        ...vnode.children
      ])
    ])
  }
}
