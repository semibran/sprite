import m from 'mithril'
import extract from 'img-extract'
import loadImage from 'img-load'
import SpriteCanvas from './comps/sprite-canvas'
import AnimCanvas from './comps/anim-canvas'
import Thumb from './comps/thumb'
import clone from './lib/img-clone'
import slice from './lib/slice'
import merge from './lib/merge'

const state = {
  sprname: 'untitled',
  tab: 'sprites',
  image: null,
  window: null,
  selects: [],
  sprites: [],
  anims: {
    tab: 'frame',
    list: [],
    select: null,
    editingName: false
  },
  timeline: {
    playing: false,
    repeat: false,
    onionSkin: true,
    pos: 0,
    selects: []
  }
}

const handleImage = async (evt) => {
  const url = URL.createObjectURL(evt.target.files[0])
  const image = await loadImage(url)
  setImage(image)
}

const setImage = (image) => {
  state.image = clone(image)
  state.sprites = slice(state.image).map((rect, i) => ({
    name: `${state.sprname}_${i}`,
    image: extract(image, ...rect),
    rect: rect
  }))
  m.redraw()
}

const select = (items, i) => (evt) => {
  if (evt.detail === 2) {
    return false
  }
  const shift = evt.shiftKey
  const ctrl = evt.ctrlKey || evt.metaKey
  const idx = items.indexOf(i)
  const prev = items[items.length - 1]
  if (shift && !ctrl && prev != null && prev !== i) {
    const dir = i > prev ? 1 : -1
    for (let j = prev; j !== i;) {
      j += dir
      if (items.indexOf(j) === -1) {
        items.push(j)
      }
    }
  } else if (ctrl && !shift) {
    if (idx === -1) {
      items.push(i)
    } else {
      items.splice(idx, 1)
    }
  } else if (idx === -1 || items.length > 1) {
    items[0] = i
    items.length = 1
  } else {
    items.length = 0
  }
  return true
}

const selectAnim = (i) => (evt) => {
  state.anims.select = state.anims.list[i]
}

const selectFrame = (i) => (evt) => {
  select(state.timeline.selects, i)(evt)
  state.timeline.pos = i
}

const selectAllFrames = () => {
  const tl = state.timeline
  const anim = state.anims.select
  tl.selects = new Array(getAnimDuration(anim)).fill(0).map((_, i) => i)
  tl.pos = 0
}

const deselectAllFrames = () => {
  const tl = state.timeline
  tl.selects = [tl.pos]
}

const deleteFrame = () => {
  const tl = state.timeline
  const anim = state.anims.select
  if (tl.selects.length) {
    tl.selects.sort()
    const frames = getFramesAt(anim, tl.selects)
    for (let i = anim.frames.length; i--;) {
      if (frames.includes(anim.frames[i])) {
        anim.frames.splice(i, 1)
      }
    }
    const idx = Math.max(0, tl.selects[0] - 1)
    tl.selects = [idx]
    tl.pos = idx
  } else {
    const frame = getFrameAt(anim, tl.pos)
    const idx = getIndexOfFrame(anim, frame)
    anim.frames.splice(idx, 1)
    tl.selects = [idx - 1]
    tl.pos = Math.max(0, idx - 1)
  }
}

const mergeSelects = () => {
  const sprites = state.sprites
  const selects = state.selects
  if (!selects.length) {
    return false
  }
  selects.sort()
  const rects = selects.map(idx => sprites[idx].rect)
  const rect = merge(rects)
  for (let i = selects.length; --i;) {
    const idx = selects[i]
    sprites.splice(idx, 1)
  }
  const idx = selects[0]
  const sprite = sprites[idx]
  sprite.rect = rect
  sprite.image = extract(state.image, ...rect)
  selects.length = 0
  return true
}

const selectTab = (tab) => () => {
  state.selects.length = 0
  state.tab = tab
}

const selectAnimTab = (tab) => () => {
  state.anims.tab = tab
}

const startNameEdit = (evt) => {
  state.anims.editingName = true
}

const endNameEdit = (evt) => {
  state.anims.editingName = false
  state.anims.select.name = evt.target.value
}

const getAnimDuration = (anim) => {
  return anim.frames.reduce((d, frame) => d + frame.duration, 0)
}

const getFrameAt = (anim, t) => {
  let f = 0
  let g = 0
  let frame = anim.frames[0]
  for (let i = 0; i < t; i++) {
    if (++g >= frame.duration) {
      frame = anim.frames[++f]
      g = 0
      if (!frame) {
        return null
      }
    }
  }
  return anim.frames[f]
}

const getFramesAt = (anim, ts) =>
  [...new Set(ts.map(t => getFrameAt(anim, t)).filter(x => x))]

const getIndexOfFrame = (anim, frame) => {
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

const toggleAnim = () => {
  if (state.timeline.playing) {
    return pauseAnim()
  } else {
    return playAnim()
  }
}

const stepPrev = () => {
  const anim = state.anims.select
  if (!anim) {
    return false
  }

  const tl = state.timeline
  const lastFrame = getAnimDuration(anim) - 1
  pauseAnim()
  if (tl.pos >= 0) {
    if (tl.pos > 0) {
      tl.pos--
    } else {
      tl.pos = lastFrame
    }
    if (tl.selects.length >= 1) {
      tl.selects = [tl.pos]
    }
    return true
  }

  return false
}

const stepNext = () => {
  const anim = state.anims.select
  if (!anim) {
    return false
  }

  const tl = state.timeline
  const lastFrame = getAnimDuration(anim) - 1
  pauseAnim()
  if (tl.pos <= lastFrame) {
    if (tl.pos < lastFrame) {
      tl.pos++
    } else {
      tl.pos = 0
    }
    if (tl.selects.length >= 1) {
      tl.selects = [tl.pos]
    }
    return true
  }

  return false
}

const pauseAnim = () => {
  const tl = state.timeline
  tl.playing = false
  if (tl.timeout) {
    cancelAnimationFrame(tl.timeout)
    tl.timeout = null
    m.redraw()
  }
  return true
}

const playAnim = () => {
  const anim = state.anims.select
  if (!anim) {
    return false
  }

  const duration = getAnimDuration(anim)
  const tl = state.timeline
  tl.playing = true
  if (tl.pos === duration - 1) {
    tl.pos = 0
  }

  tl.timeout = requestAnimationFrame(function animate () {
    if (tl.pos < duration - 1) {
      tl.pos++
    } else if (tl.repeat) {
      tl.pos = 0
    } else {
      tl.playing = false
    }
    if (tl.playing) {
      tl.timeout = requestAnimationFrame(animate)
    }
    m.redraw()
  })
  return true
}

const toggleRepeat = () => {
  const tl = state.timeline
  tl.repeat = !tl.repeat
}

const toggleOnionSkin = () => {
  const tl = state.timeline
  tl.onionSkin = !tl.onionSkin
}

const createAnim = () => {
  if (!state.selects.length) {
    return false
  }

  const anim = {
    name: 'untitled',
    loop: false,
    next: null,
    frames: state.selects.map(idx => ({
      sprite: state.sprites[idx],
      origin: { x: 0, y: 0 },
      duration: 1
    }))
  }
  state.anims.list.push(anim)
  state.anims.select = anim
  state.selects.length = 0
  return true
}

const handleFrameOrigin = (axis) => (evt) => {
  const val = parseInt(evt.target.value)
  if (axis === 'x') {
    setFrameOrigin(val, null)
  } else if (axis === 'y') {
    setFrameOrigin(null, val)
  }
}

const selectTimelineOrigin = (evt) => {
  const tl = state.timeline
  const anim = state.anims.select
  const frames = anim && getFramesAt(anim, tl.selects)
  const [xpos, ypos] = evt.target.value.split('-')
  for (const frame of frames) {
    if (xpos === 'left') {
      frame.origin.x = 0
    } else if (xpos === 'center') {
      frame.origin.x = Math.floor(frame.sprite.image.width / 2)
    } else if (xpos === 'right') {
      frame.origin.x = frame.sprite.image.width
    }
    if (ypos === 'top') {
      frame.origin.y = 0
    } else if (ypos === 'middle') {
      frame.origin.y = Math.floor(frame.sprite.image.height / 2)
    } else if (ypos === 'bottom') {
      frame.origin.y = frame.sprite.image.height
    }
  }
}

const setFrameOrigin = (x, y) => {
  const anim = state.anims.select
  const frame = anim && anim.frames[state.timeline.pos]
  if (x != null) frame.origin.x = x
  if (y != null) frame.origin.y = y
}

const moveFrameOrigin = (dx, dy) => {
  const tl = state.timeline
  const anim = state.anims.select
  const frames = getFramesAt(anim, tl.selects)
  for (const frame of frames) {
    frame.origin.x += dx
    frame.origin.y += dy
  }
}

const changeFrameDuration = (frame) => (evt) => {
  frame.duration = parseInt(evt.target.value)
}

const changeFramesDuration = (evt) => {
  const tl = state.timeline
  const anim = state.anims.select
  const frames = getFramesAt(anim, tl.selects)
  for (const frame of frames) {
    frame.duration = parseInt(evt.target.value)
  }
}

const openWindow = (type) => () => {
  state.window = type
}

const closeWindow = () => {
  state.window = null
}

const Upload = () =>
  m('.upload-wrap', [
    m('label.button.upload-button', { for: 'upload' }, [
      m('span.icon.material-icons-round', 'publish'),
      'Select an image',
      m('input#upload', {
        type: 'file',
        accept: 'image/png, image/gif',
        multiple: false,
        onchange: handleImage
      })
    ]),
    m('span.upload-text', 'Accepted formats: .png, .gif')
  ])

const Timeline = () => {
  const anim = state.anims.select
  const tl = state.timeline
  const duration = getAnimDuration(anim)
  return m.fragment({
    oncreate: (vnode) => {
      window.addEventListener('keydown', (evt) => {
        if (evt.key === ' ' && !evt.repeat) {
          toggleAnim()
        } else if (evt.key === ',') {
          stepPrev()
        } else if (evt.key === '.') {
          stepNext()
        } else if (evt.code === 'KeyA' && (evt.ctrlKey || evt.metaKey)) {
          evt.preventDefault()
          selectAllFrames()
        } else if (evt.code === 'Escape') {
          evt.preventDefault()
          deselectAllFrames()
        } else if (evt.key === 'Shift') {
          evt.redraw = false
        }
      }, true)
    }
  }, m('#timeline', [
    m('.timeline-controls', [
      m('.controls-lhs', [
        m('.panel.-move', [
          m('.panel-button', { onclick: stepPrev }, [
            m('span.icon.material-icons-round.-step-prev', 'eject')
          ]),
          m('.panel-button', {
            class: state.timeline.playing ? '-select' : '',
            onclick: toggleAnim
          }, [
            m('span.icon.material-icons-round.-play',
              state.timeline.playing ? 'pause' : 'play_arrow')
          ]),
          m('.panel-button', { onclick: stepNext }, [
            m('span.icon.material-icons-round.-step-next', 'eject')
          ])
        ]),
        m('.panel.-repeat', [
          m('.panel-button', {
            class: state.timeline.repeat ? '-select' : '',
            onclick: toggleRepeat
          }, [
            m('span.icon.material-icons-round.-small', 'repeat')
          ])
        ]),
        m('.panel.-onion-skin', [
          m('.panel-button', {
            class: state.timeline.onionSkin ? '-select' : '',
            onclick: toggleOnionSkin
          }, [
            m('span.icon.material-icons-round.-small', 'auto_awesome_motion')
          ])
        ])
      ]),
      m('.controls-rhs', [
        m('.action.-add.icon.material-icons-round',
          // { onclick: addFrame },
          'add'),
        m('.action.-clone.icon.-small.material-icons-round',
          // { onclick: cloneFrame },
          'filter_none'),
        m('.action.-remove.icon.material-icons-round', {
          onclick: deleteFrame
        }, 'delete_outline')
      ])
    ]),
    m('.timeline', [
      m('table.timeline-frames', {
        tabindex: '0',
        onkeydown: (evt) => evt.preventDefault()
      }, [
        m('tr.frame-numbers', new Array(duration).fill(0).map((_, i) =>
          m.fragment({
            onupdate: (vnode) => {
              if (tl.pos === i) {
                vnode.dom.scrollIntoView()
              }
            }
          }, m('th.frame-number', {
            class: (tl.pos === i ? '-focus' : '')
              + (tl.selects.includes(i) ? ' -select' : ''),
            onclick: selectFrame(i)
          }, i + 1))
        )),
        m('tr.frames', anim.frames.map((frame, i) =>
          m('td.frame', {
            key: `${i}-${frame.sprite.name}`,
            class: (getFrameAt(anim, tl.pos) === frame ? '-focus' : '')
              + (getFramesAt(anim, tl.selects).includes(frame) ? ' -select' : ''),
            colspan: frame.duration > 1 ? frame.duration : null,
            onclick: selectFrame(getIndexOfFrame(anim, frame))
          }, [
            m('.thumb.-frame', [
              m(Thumb, { image: frame.sprite.image })
            ])
          ])
        ))
      ])
    ])
  ]))
}

const AnimsEditor = () => {
  const tl = state.timeline
  const anim = state.anims.select
  const selects = tl.selects
  const frame = anim && getFrameAt(anim, tl.pos)
  const frames = anim && (selects.length > 1
    ? getFramesAt(anim, selects)
    : getFramesAt(anim, [tl.pos - 1, tl.pos, tl.pos + 1])
  )
  return m('.editor-column', [
    m('#editor.-anims', [
      state.anims.list.length
        ? m(AnimCanvas, {
            frame,
            frames: tl.onionSkin ? frames : [],
            playing: tl.playing,
            onchangeoffset: moveFrameOrigin
          })
        : null
    ]),
    anim ? Timeline() : null
  ])
}

const RightSidebar = () => {
  const tab = state.anims.tab
  const selects = state.timeline.selects
  return m('aside.sidebar.-right', [
    m('.sidebar-header', [
      m('.sidebar-tabs', [
        m('.tab.-anim', {
          class: tab === 'anim' ? '-active' : '',
          onclick: selectAnimTab('anim')
        }, 'State'),
        m('.tab.-frame', {
          class: tab === 'frame' ? '-active' : '',
          onclick: selectAnimTab('frame')
        }, 'Frame')
      ])
    ]),
    tab === 'anim' ? AnimTab() : null,
    tab === 'frame' && selects.length <= 1 ? FrameTab() : null,
    tab === 'frame' && selects.length > 1 ? FramesTab() : null
  ])
}

const AnimTab = () => {
  const anim = state.anims.select
  return anim
    ? m('.sidebar-content', [
        m('section.-name', [
          m('h4.sidebar-key', 'Name'),
          m('span.sidebar-value', [
            m('.sidebar-field', anim.name)
          ])
        ])
      ])
    : null
}

const FrameTab = () => {
  const anim = state.anims.select
  const frame = anim && getFrameAt(anim, state.timeline.pos)
  return frame
    ? m('.sidebar-content', [
        m('section.-sprite', [
          m('h4.sidebar-key', 'Sprite'),
          m('span.sidebar-value', [
            m('.sidebar-field', frame.sprite.name)
          ])
        ]),
        m('section.-duration', [
          m('h4.sidebar-key', 'Duration'),
          m('span.sidebar-value', [
            m('.sidebar-field.-text', [
              m('input.sidebar-input.-number', {
                type: 'number',
                value: frame.duration,
                min: 1,
                max: 100,
                onchange: changeFrameDuration(frame)
              }),
              m('span.sidebar-fieldname',
                frame.duration === 1 ? ' frame' : ' frames')
            ])
          ])
        ]),
        m('section.-origin', [
          m('h4.sidebar-key', 'Origin'),
          m('span.sidebar-value', [
            m('.sidebar-fields', [
              m('.sidebar-field.-x', [
                m('span.sidebar-fieldname', 'X'),
                m('input.-sidebar-field', {
                  onchange: handleFrameOrigin('x'),
                  value: frame.origin.x
                })
              ]),
              m('.sidebar-field.-y', [
                m('span.sidebar-fieldname', 'Y'),
                m('input.-sidebar-field', {
                  onchange: handleFrameOrigin('y'),
                  value: frame.origin.y
                })
              ])
            ])
          ])
        ])
      ])
    : null
}

const FramesTab = () => {
  const anim = state.anims.select
  const selects = state.timeline.selects
  const frames = getFramesAt(anim, selects)
  const equalDuration = !frames.find(frame => frame.duration !== frames[0].duration)
  const duration = equalDuration
    ? frames[0].duration
    : frames.reduce((d, frame) => frame.duration < d ? frame.duration : d, Infinity)
  return m('.sidebar-content', [
    m('section.-desc', [
      `${selects.length} frames selected`
    ]),
    m('section.-duration', [
      m('h4.sidebar-key', 'Speed'),
      m('span.sidebar-value', [
        m('.sidebar-field.-text', [
          m('input.sidebar-input.-number', {
            type: 'number',
            value: duration,
            min: 1,
            max: 100,
            onchange: changeFramesDuration
          }),
          m('span.sidebar-fieldname', duration === 1 ? ' frame/tick' : ' frames/tick')
        ])
      ])
    ]),
    m('section.-origin', [
      m('h4.sidebar-key', 'Origin'),
      m('select.sidebar-value', { onchange: selectTimelineOrigin }, [
        m('option', { value: 'custom' }, 'Custom'),
        m('option', { value: 'left-top' }, 'Top left'),
        m('option', { value: 'center-top' }, 'Top'),
        m('option', { value: 'right-top' }, 'Top right'),
        m('option', { value: 'left-middle' }, 'Left'),
        m('option', { value: 'center-middle' }, 'Center'),
        m('option', { value: 'right-middle' }, 'Right'),
        m('option', { value: 'left-bottom' }, 'Bottom left'),
        m('option', { value: 'center-bottom' }, 'Bottom'),
        m('option', { value: 'right-bottom' }, 'Bottom right')
      ])
    ])
  ])
}

const CreateWindow = () =>
  m('.window.-create', [
    m('.window-header', [
      m('.window-title', 'Create new state'),
      m('span.action.icon.material-icons-round',
        { onclick: closeWindow },
        'close')
    ]),
    m('.window-content', [
      m('.window-bar', [
        state.selects.length === 1
          ? '1 sprite selected'
          : `${state.selects.length} sprites selected`,
        m('.view-toggle', [
          m('span.icon.material-icons-round.action.-select', 'view_module'),
          m('span.icon.material-icons-round.action', 'view_list')
        ])
      ]),
      m('.window-entries', [
        m('.window-entrygrid', state.sprites.map((sprite, i) =>
          m('.entry.action', {
            key: `${i}-${sprite.name}-${sprite.rect[2]},${sprite.rect[3]}`,
            onclick: select(state.selects, i),
            class: state.selects.includes(i) ? '-select' : null
          }, [
            m('.thumb.-entry', [
              m(Thumb, { image: sprite.image })
            ]),
            m('.entry-name', sprite.name)
          ])
        ))
      ]),
      m('.window-footer', [
        m('button.-create', {
          onclick: () => { createAnim(); closeWindow() }
        }, [
          m('span.icon.material-icons-round', 'add'),
          'Create'
        ]),
        m('button.-cancel.-alt', { onclick: closeWindow }, 'Cancel')
      ])
    ])
  ])

loadImage('../tmp/copen.png')
  .then(setImage)
  .catch(console.error)

const view = () =>
  m('main.app', [
    m('header', [
      m('.header-block', [
        m('span.icon.material-icons-round', 'menu'),
        m('.header-text', [
          m('.header-title', 'Untitled'),
          m('.header-subtitle', 'Current project')
        ])
      ])
    ]),
    m('.content', [
      m('aside.sidebar.-left', [
        m('.sidebar-header', [
          m('.sidebar-tabs', [
            m('.tab.-sprites', {
              class: state.tab === 'sprites' ? '-active' : '',
              onclick: selectTab('sprites')
            }, [`Sprites (${state.sprites.length})`]),
            m('.tab.-anims', {
              class: state.tab === 'anims' ? '-active' : '',
              onclick: selectTab('anims')
            }, ['States'])
          ]),
          m('.sidebar-subheader', [
            m('label.sidebar-search', { for: 'search' }, [
              m('span.icon.material-icons-round', 'search'),
              m('input', { id: 'search', placeholder: 'Search' })
            ]),
            m('.action.-add.material-icons-round',
              { onclick: openWindow('create') },
              'add')
          ])
        ]),
        state.tab === 'sprites'
          ? state.sprites.length
              ? m('.sidebar-content', state.sprites.map((sprite, i) =>
                  m('.entry', {
                    key: `${i}-${sprite.name}-${sprite.rect[2]},${sprite.rect[3]}`,
                    onclick: select(state.selects, i),
                    class: state.selects.includes(i) ? '-select' : null
                  }, [
                    m('.thumb.-entry', [
                      m(Thumb, { image: sprite.image })
                    ]),
                    m('.entry-name', sprite.name)
                  ])
                ))
              : m('.sidebar-content.-empty', [
                m('.sidebar-notice', 'No sprites registered.')
              ])
          : null,
        state.tab === 'anims'
          ? state.anims.list.length
              ? m('.sidebar-content', state.anims.list.map((anim, i) =>
                  m('.entry', {
                    key: i + '-' + anim.name,
                    onclick: selectAnim(i),
                    class: state.anims.select === anim ? '-select' : null
                  }, [
                    m('.thumb.-entry', [
                      m(Thumb, { image: anim.frames[0].sprite.image })
                    ]),
                    state.anims.select === anim && state.anims.editingName
                      ? m.fragment({ oncreate: (vnode) => vnode.dom.select() }, [
                          m('input.entry-name', {
                            value: anim.name,
                            onblur: endNameEdit
                          })
                        ])
                      : m('.entry-name', { ondblclick: startNameEdit }, anim.name)
                  ])
                ))
              : m('.sidebar-content.-empty', [
                m('.sidebar-notice', [
                  'No states registered.',
                  m('button.-create', { onclick: openWindow('create') }, [
                    m('span.icon.material-icons-round', 'add'),
                    'Create'
                  ])
                ])
              ])
          : null,
        state.tab === 'sprites'
          ? m('.sidebar-footer', [
              m('button.-split', { disabled: true }, [
                m('span.icon.material-icons-round', 'vertical_split'),
                'Split'
              ]),
              m('button.-merge', {
                disabled: state.selects.length < 2,
                onclick: state.selects.length >= 2 && mergeSelects
              }, [
                m('span.icon.material-icons-round', 'aspect_ratio'),
                'Merge'
              ])
            ])
          : null
      ]),
      state.tab === 'sprites'
        ? m('#editor.-sprites', [
            !state.image
              ? Upload()
              : m(SpriteCanvas, {
                image: state.image,
                rects: state.sprites.map(sprite => sprite.rect),
                selects: state.selects
              })
          ])
        : null,
      state.tab === 'anims' ? AnimsEditor() : null,
      state.tab === 'anims'
        ? RightSidebar()
        : null
    ]),
    state.window !== null
      ? m('.overlay', { onclick: closeWindow })
      : null,
    state.window === 'create'
      ? CreateWindow()
      : null
  ])

m.mount(document.body, () => ({ view }))
