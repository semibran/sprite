
import m from 'mithril'
import cache from '../app/cache'
import { selectSprite } from './panel-sprites'

let onmousedown = null
let onmousemove = null
let onmouseup = null
let sprites = null
let pos = null
let pan = null
let click = false
let hover = -1

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

export const endPan = (state) => ({
  ...state,
  editor: { ...state.editor, click: false, pan: null }
})

export const hoverSprite = (state, { index }) => ({
  ...state,
  editor: { ...state.editor, hover: index }
})

export const unhoverSprite = (state) => ({
  ...state,
  editor: { ...state.editor, hover: -1 }
})

export const deselect = (state) => ({
  ...state,
  select: { ...state.select, target: null, items: [] }
})

export default function Editor (state, dispatch) {
  ;({ sprites } = state)
  ;({ pos, pan, hover, click } = state.editor)
  const image = cache.image
  return m('.editor', {
    class: [
      pan && (!click || hover === -1) ? '-pan' : '',
      hover !== -1 ? '-hover' : ''
    ].join(' ')
  }, [
    m.fragment({
      oncreate: (vnode) => {
        const findSelect = (evt) => {
          const rect = vnode.dom.getBoundingClientRect()
          const x = evt.pageX - rect.left
          const y = evt.pageY - rect.top
          return sprites.findIndex((sprite) => {
            const [left, top, width, height] = sprite.rect
            return x >= left &&
              y >= top &&
              x < left + width &&
              y < top + height
          })
        }

        vnode.dom.addEventListener('mousedown', (onmousedown = (evt) => {
          dispatch(startPan, { x: evt.pageX, y: evt.pageY })
        }))

        window.addEventListener('mousemove', (onmousemove = (evt) => {
          if (pan) {
            dispatch(updatePan, { x: evt.pageX, y: evt.pageY })
          } else {
            const select = findSelect(evt)
            if (select !== -1) {
              if (hover === -1) {
                dispatch(hoverSprite, { index: select })
              }
            } else if (hover !== -1) {
              dispatch(unhoverSprite)
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
