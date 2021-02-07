import m from 'mithril'
import extract from 'img-extract'
import loadImage from 'img-load'
import Canvas from './comps/canvas'
import Thumb from './comps/thumb'
import clone from './lib/img-clone'
import slice from './lib/slice'
import merge from './lib/merge'

const state = {
  sprname: 'untitled',
  tab: 'anims',
  image: null,
  window: null,
  sprites: [],
  anims: [],
  selects: []
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

const setSelect = (i) => (evt) => {
  const idx = state.selects.indexOf(i)
  const prev = state.selects[state.selects.length - 1]
  const shift = evt.shiftKey
  const ctrl = evt.ctrlKey || evt.metaKey
  if (shift && !ctrl && prev !== undefined && prev !== i) {
    const dir = i > prev ? 1 : -1
    for (let j = prev; j !== i;) {
      j += dir
      if (state.selects.indexOf(j) === -1) {
        state.selects.push(j)
      }
    }
  } else if (ctrl && !shift) {
    if (idx === -1) {
      state.selects.push(i)
    } else {
      state.selects.splice(idx, 1)
    }
  } else {
    if (idx === -1 || state.selects.length > 1) {
      state.selects = [i]
    } else {
      state.selects = []
    }
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

const createState = () => {
  if (!state.selects.length) {
    return false
  }

  state.anims.push({
    name: 'untitled',
    loop: false,
    next: null,
    frames: state.selects.map(idx => ({
      sprite: state.sprites[idx],
      origin: [0, 0],
      duration: 1
    }))
  })
  state.selects = [state.anims.length - 1]
  return true
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
  const anim = state.tab === 'anims'
    && state.anims.length
    && state.selects.length
    && state.anims[state.selects[state.selects.length - 1]]
  console.log(anim)
  return m('#timeline', [
    m('.timeline-meta'),
    m('.frames', anim
      ? anim.frames.map((frame, i) =>
          m('.frame', [
            m('.frame-number', i),
            m('.thumb.-frame', [
              m(Thumb, { image: frame.sprite.image })
            ])
          ])
        )
      : null
    ),
    m('.timeline-controls', [
      m('.panel.-move', [
        m('.panel-button', [
          m('span.icon.material-icons-round.-step-prev', 'eject')
        ]),
        m('.panel-button', [
          m('span.icon.material-icons-round.-play', 'play_arrow')
        ]),
        m('.panel-button', [
          m('span.icon.material-icons-round.-step-next', 'eject')
        ])
      ]),
      m('.panel.-repeat', [
        m('.panel-button', [
          m('span.icon.material-icons-round.-small', 'repeat')
        ])
      ]),
      m('.panel.-onion-skin', [
        m('.panel-button', [
          m('span.icon.material-icons-round.-small', 'filter_none')
        ])
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
        state.selects.length == 1
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
            onclick: setSelect(i),
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
          onclick: () => { createState(); closeWindow() }
        }, [
          m('span.icon.material-icons-round', 'add'),
          'Create'
        ]),
        m('button.-cancel.-alt', { onclick: closeWindow }, 'Cancel')
      ])
    ])
  ])

loadImage('../tmp/test.png')
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
      m('aside.sidebar', [
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
                    onclick: setSelect(i),
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
          ? state.anims.length
              ? m('.sidebar-content', state.anims.map((anim, i) =>
                  m('.entry', {
                    key: i + '-' + anim.name,
                    onclick: setSelect(i),
                    class: state.selects.includes(i) ? '-select' : null
                  }, [
                    m('.thumb.-entry', [
                      m(Thumb, { image: anim.frames[0].sprite.image })
                    ]),
                    m('.entry-name', anim.name)
                  ])
                ))
              : m('.sidebar-content.-empty', [
                m('.sidebar-notice', [
                  'No anims registered.',
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
        ? m('#editor', [
            !state.image
              ? Upload()
              : m(Canvas, {
                image: state.image,
                rects: state.sprites.map(sprite => sprite.rect),
                selects: state.selects
              })
          ])
        : m('.editor-column', [
          m('#editor'),
          Timeline()
        ])
    ]),
    state.window !== null
      ? m('.overlay', { onclick: closeWindow })
      : null,
    state.window === 'create'
      ? CreateWindow()
      : null
  ])

m.mount(document.body, () => ({ view }))
