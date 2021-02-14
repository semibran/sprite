
import m from 'mithril'
import cache from '../app/cache'

let onmousedown = null
let onmousemove = null
let onmouseup = null
let pressed = false

export const startPan = (state, { x, y }) => ({
  ...state,
  editor: {
    ...state.editor,
    pan: {
      x: x - state.editor.pos.x,
      y: y - state.editor.pos.y
    }
  }
})

export const updatePan = (state, { x, y }) => ({
  ...state,
  editor: {
    ...state.editor,
    pos: {
      x: x - state.editor.pan.x,
      y: y - state.editor.pan.y
    }
  }
})

export const endPan = (state) => ({
  ...state,
  editor: { ...state.editor, pan: null }
})

export default function Editor (state, dispatch) {
  const image = cache.image
  const { pos, pan } = state.editor
  return m('.editor', { class: pan ? '-pan' : '' }, [
    m.fragment({
      oncreate: (vnode) => {
        vnode.dom.addEventListener('mousedown', (onmousedown = (evt) => {
          dispatch(startPan, { x: evt.pageX, y: evt.pageY })
          pressed = true
        }))

        window.addEventListener('mousemove', (onmousemove = (evt) => {
          if (pressed) {
            dispatch(updatePan, { x: evt.pageX, y: evt.pageY })
          }
        }))

        window.addEventListener('mouseup', (onmouseup = () => {
          dispatch(endPan)
          pressed = false
        }))
      },
      onremove: (vnode) => {
        vnode.dom.removeEventListener('mousedown', onmousedown)
        window.removeEventListener('mousemove', onmousemove)
        window.removeEventListener('mouseup', onmouseup)
      },
      onupdate: (vnode) => {
        const canvas = vnode.dom
        if (image) {
          canvas.width = image.width
          canvas.height = image.height
          fill(canvas)

          const context = canvas.getContext('2d')
          const xoffset = canvas.width / 2 - image.width / 2
          context.drawImage(image, Math.round(xoffset), 0)
        }
      }
    }, m('canvas', {
      style: `transform: translate(${pos.x}px, ${pos.y}px)`
    }))
  ])
}

function fill (canvas) {
  const context = canvas.getContext('2d')
  context.fillStyle = '#999'
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (let y = 0; y < canvas.height; y += 16) {
    for (let x = 0; x < canvas.width; x += 16) {
      if ((x + y) % 32) {
        context.fillStyle = '#ccc'
        context.fillRect(x, y, 16, 16)
      }
    }
  }
}
