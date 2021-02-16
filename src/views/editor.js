
import m from 'mithril'
import deepClone from 'lodash.clonedeep'
import cssify from 'css-string'
import cache from '../app/cache'
import { selectSprite } from './panel-sprites'

let editor = null
let canvas = null
let onmousedown = null
let onmousemove = null
let onmouseup = null
let onwheel = null
let sprites = null
let pos = null
let pan = null
let click = false
let hover = -1
let scale = 1
let mouse = null

export const startPan = (state, { x, y }) => ({
  ...state,
  editor: {
    ...state.editor,
    click: true,
    pan: {
      x: x - state.editor.pos.x,
      y: y - state.editor.pos.y
    }
  }
})

export const updatePan = (state, { x, y }) => {
  if (!state.editor.pan) return state
  return {
    ...state,
    editor: {
      ...state.editor,
      click: false,
      pos: {
        x: x - state.editor.pan.x,
        y: y - state.editor.pan.y
      }
    }
  }
}

export const moveCamera = (state, { x, y }) => {
  const editor = deepClone(state.editor)
  editor.pos.x += x
  editor.pos.y += y
  return { ...state, editor }
}

export const endPan = (state) => ({
  ...state,
  editor: { ...state.editor, click: false, pan: null }
})

export const zoomCamera = (state, scale) => ({
  ...state,
  editor: { ...state.editor, scale }
})

export const deselect = (state) => ({
  ...state,
  select: { ...state.select, target: null, items: [] }
})

export default function Editor (state, dispatch) {
  ;({ sprites } = state)
  ;({ pos, pan, click, scale } = state.editor)
  const image = cache.image
  return m('.editor', {
    class: [
      pan && (!click || hover === -1) ? '-pan' : '',
      hover !== -1 ? '-hover' : ''
    ].join(' ')
  }, [
    m.fragment({
      oncreate: (vnode) => {
        canvas = vnode.dom
        editor = canvas.parentNode

        const findSelect = (evt) => {
          const rect = canvas.getBoundingClientRect()
          const x = (evt.pageX - rect.left) / scale - 1
          const y = (evt.pageY - rect.top) / scale - 1
          return sprites.findIndex((sprite) => {
            const [left, top, width, height] = sprite.rect
            return x >= left - 1 &&
              y >= top - 1 &&
              x < left + width + 1 &&
              y < top + height + 1
          })
        }

        editor.addEventListener('mousedown', (onmousedown = (evt) => {
          dispatch(startPan, { x: evt.pageX / scale, y: evt.pageY / scale })
        }))

        window.addEventListener('mousemove', (onmousemove = (evt) => {
          if (pan) {
            dispatch(updatePan, { x: evt.pageX / scale, y: evt.pageY / scale })
          } else {
            const select = findSelect(evt)
            if (select !== -1) {
              if (hover !== select) {
                hover = select
                m.redraw()
              }
            } else if (hover !== -1) {
              hover = -1
              m.redraw()
            }
          }
        }))

        window.addEventListener('mouseup', (onmouseup = (evt) => {
          if (click) {
            const select = findSelect(evt)
            if (select !== -1) {
              dispatch(selectSprite, {
                index: select,
                opts: { ctrl: evt.ctrlKey || evt.metaKey || evt.shiftKey }
              })
            } else {
              dispatch(deselect)
            }
          }
          if (pan) {
            dispatch(endPan)
          }
        }))

        editor.addEventListener('wheel', (onwheel = (evt) => {
          evt.preventDefault()
          const delta = evt.deltaY * 0.01
          const newScale = Math.min(8, Math.max(1, scale - delta))
          // const rect = editor.getBoundingClientRect()
          // const x = (evt.clientX - rect.left - rect.width / 2) * delta
          // const y = (evt.clientY - rect.top - rect.height / 2) * delta
          if (scale !== newScale) {
            scale = newScale
            mouse = { x, y }
            dispatch(zoomCamera, newScale)
            // dispatch(moveCamera, { x, y })
          }
        }))
      },
      onremove: (vnode) => {
        canvas.removeEventListener('mousedown', onmousedown)
        window.removeEventListener('mousemove', onmousemove)
        window.removeEventListener('mouseup', onmouseup)
        editor.removeEventListener('wheel', onwheel)
      },
      onupdate: (vnode) => {
        if (image) {
          canvas.width = image.width
          canvas.height = image.height
          fill(canvas)

          const context = canvas.getContext('2d')
          const xoffset = canvas.width / 2 - image.width / 2

          sprites.forEach((sprite, i) => {
            const [left, top, width, height] = sprite.rect
            const selected = state.select.target === 'sprites' &&
              state.select.items.includes(i)
            const hovered = hover === i
            if (selected) {
              context.lineWidth = 2
              context.fillStyle = '#36d'
              context.strokeStyle = '#36d'
              context.beginPath()
              context.rect(...sprite.rect)
              context.globalAlpha = 0.25
              context.fill()
              context.globalAlpha = 1
              context.stroke()
            } else if (hovered) {
              context.lineWidth = 2
              context.strokeStyle = '#36d'
              context.strokeRect(...sprite.rect)
            } else {
              context.lineWidth = 1
              context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
              context.strokeRect(left - 0.5, top - 0.5, width + 1, height + 1)
            }
          })

          context.drawImage(image, Math.round(xoffset), 0)
        }
      }
    }, m('canvas', {
      style: cssify({
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
        'transform-origin': `${-pos.x}px ${-pos.y}px`
      })
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
