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
    select: 0,
    editingName: false
  },
  timeline: {
    playing: false,
    repeat: true,
    onionSkin: true,
    frameidx: 0,
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
  state.timeline.frameidx = i
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

const toggleAnim = () => {
  if (state.timeline.playing) {
    return pauseAnim()
  } else {
    return playAnim()
  }
}

const stepPrev = () => {
  const tl = state.timeline
  pauseAnim()
  if (tl.frameidx > 0) {
    tl.frameidx--
    return true
  }
}

const stepNext = () => {
  const anim = state.anims.select
  if (!anim) {
    return false
  }

  const tl = state.timeline
  pauseAnim()
  if (tl.frameidx < anim.frames.length - 1) {
    tl.frameidx++
    return true
  }
}

const pauseAnim = () => {
  const tl = state.timeline
  tl.playing = false
  if (tl.timeout) {
    clearTimeout(tl.timeout)
    tl.timeout = null
  }
  return true
}

const playAnim = () => {
  const anim = state.anims.select
  if (!anim) {
    return false
  }

  const tl = state.timeline
  tl.playing = true
  if (tl.frameidx === anim.frames.length - 1) {
    tl.frameidx = 0
  }

  tl.timeout = setTimeout(function animate () {
    if (tl.frameidx < anim.frames.length - 1) {
      tl.frameidx++
    } else if (tl.repeat) {
      tl.frameidx = 0
    } else {
      tl.playing = false
    }
    if (tl.playing) {
      tl.timeout = setTimeout(animate, 34)
    }
    m.redraw()
  }, 34)
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
  const frames = anim && tl.selects.map(idx => anim.frames[idx])
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
  const frame = anim && anim.frames[state.timeline.frameidx]
  if (x != null) frame.origin.x = x
  if (y != null) frame.origin.y = y
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
  const anim = state.tab === 'anims' && state.anims.select
  return m('#timeline', [
    m('.timeline-meta'),
    m('.timeline-frames', [
      m('.frames', anim
        ? anim.frames.map((frame, i) =>
            m('.frame', {
              key: `${i}-${frame.sprite.name}`,
              onclick: selectFrame(i),
              class: state.timeline.selects.includes(i) ? '-select' : null
            }, [
              m('.frame-number', i + 1),
              m('.thumb.-frame', [
                m(Thumb, { image: frame.sprite.image })
              ])
            ])
          )
        : null
      )
    ]),
    m('.timeline-controls', [
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
          m('span.icon.material-icons-round.-small', 'filter_none')
        ])
      ])
    ])
  ])
}

const AnimsEditor = () => {
  const tl = state.timeline
  const anim = state.anims.select
  const frame = anim && anim.frames[tl.frameidx]
  const frameBefore = anim && anim.frames[tl.frameidx - 1]
  const frameAfter = anim && anim.frames[tl.frameidx + 1]
  const onionSkin = tl.onionSkin && !tl.playing
  return m('.editor-column', [
    m('#editor.-anims', [
      state.anims.list.length
        ? m(AnimCanvas, {
            frame,
            frameBefore: onionSkin ? frameBefore : null,
            frameAfter: onionSkin ? frameAfter : null,
            onchangeoffset: setFrameOrigin
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
    tab === 'frame' && selects.length === 1 ? FrameTab() : null,
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
  const frame = anim && anim.frames[state.timeline.frameidx]
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
              frame.duration,
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
  const frames = selects.map(idx => anim.frames[idx])
  const equalDuration = !frames.find(frame =>
    frame.duration !== frames[0].duration)
  const duration = equalDuration ? frames[0].duration : '*'
  return m('.sidebar-content', [
    m('section.-desc', [
      `${selects.length} frames selected`
    ]),
    m('section.-duration', [
      m('h4.sidebar-key', 'Duration'),
      m('span.sidebar-value', [
        m('.sidebar-field.-text', [
          duration,
          m('span.sidebar-fieldname', duration === 1 ? ' frame' : ' frames')
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

loadImage('../tmp/test.gif')
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
