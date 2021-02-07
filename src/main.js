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
  tab: 'states',
  image: null,
  state: null,
  window: null,
  sprites: [],
  selects: [],
  states: []
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

const toggleEntry = (i) => (evt) => {
  const idx = state.selects.indexOf(i)
  if (idx === -1) {
    state.selects.push(i)
  } else {
    state.selects.splice(idx, 1)
  }
}

const mergeSelects = () => {
  state.selects.sort()
  const rects = state.selects.map(idx => state.sprites[idx].rect)
  for (let i = state.selects.length; --i;) {
    const idx = state.selects[i]
    state.sprites.splice(idx, 1)
  }
  const idx = state.selects[0]
  const rect = merge(rects)
  state.sprites[idx].rect = rect
  state.sprites[idx].image = extract(state.image, ...rect)
  state.selects.length = 0
}

const selectTab = (tab) => () => {
  state.tab = tab
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

const Timeline = () =>
  m('#timeline', [
    m('.timeline-meta'),
    m('.frames'),
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
        '0 sprites selected',
        m('.view-toggle', [
          m('span.icon.material-icons-round.action.-select', 'view_module'),
          m('span.icon.material-icons-round.action', 'view_list')
        ])
      ]),
      m('.window-entries', [
        m('.window-entrygrid', state.sprites.map((sprite, i) =>
          m('.entry', {
            key: i + '-' + sprite.name,
            // onclick: toggleEntry(i),
            // class: state.selects.includes(i) ? '-select' : null
          }, [
            m('.entry-thumb', [
              m(Thumb, { image: sprite.image })
            ]),
            m('.entry-name', sprite.name)
          ])
        ))
      ]),
      m('.window-footer', [
        m('button.-create', { onclick: closeWindow }, [
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
            m('.tab.-states', {
              class: state.tab === 'states' ? '-active' : '',
              onclick: selectTab('states')
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
                    key: i + '-' + sprite.name,
                    onclick: toggleEntry(i),
                    class: state.selects.includes(i) ? '-select' : null
                  }, [
                    m('.entry-thumb', [
                      m(Thumb, { image: sprite.image })
                    ]),
                    m('.entry-name', sprite.name)
                  ])
                ))
              : m('.sidebar-content.-empty', [
                m('.sidebar-notice', 'No sprites registered.')
              ])
          : null,
        state.tab === 'states'
          ? state.states.length
              ? m('.sidebar-content', state.states.map((state, i) => {

                }))
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
              m('button.button.-split', { disabled: true }, [
                m('span.icon.material-icons-round', 'vertical_split'),
                'Split'
              ]),
              m('button.button.-merge', {
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
