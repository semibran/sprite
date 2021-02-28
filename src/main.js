
import m from 'mithril'
import { createStore, applyMiddleware, compose } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import loadImage from 'img-load'
import thunk from './lib/rethunk'
import reduce from './lib/combine-reducers'
import App from './views/app'
import { onkeydown, onkeyup } from './app/keybind'
import cache from './app/cache'
import * as actions from './actions'

const initialState = {
  project: { name: 'Untitled' },
  shift: false,
  panel: 'sprites',
  panels: {
    sprites: true,
    props: true,
    timeline: true
  },
  select: {
    list: [],
    focus: null,
    renaming: false
  },
  sprites: {
    list: [],
    editor: {
      pos: { x: 0, y: 0 },
      scale: 1
    }
  },
  anims: {
    list: [],
    editor: {
      pos: { x: 0, y: 0 },
      scale: 2
    },
    index: 0,
    creating: false
  },
  timeline: {
    index: 0,
    subindex: 0,
    playing: false,
    repeat: false,
    onionskin: false
  }
}

Object.assign(cache, {
  image: null,
  timeout: null,
  sprites: [],
  zoom: 1,
  messages: {}
})

const persistConfig = { key: 'root', storage }
const reducer = persistReducer(persistConfig, reduce(actions, initialState))
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const enhancer = composeEnhancers(applyMiddleware(thunk))
const store = createStore(reducer, enhancer)
window.persistor = persistStore(store)
store.subscribe(m.redraw)

const dataURL = localStorage.getItem('image')
const useImage = (image) => {
  cache.image = image
  store.dispatch(actions.useImage)
  if (store.getState().timeline.playing) {
    store.dispatch(actions.startPlay)
  }
}

if (dataURL) {
  const image = new Image()
  image.src = dataURL
  image.onload = () => useImage(image)
} else {
  loadImage('../tmp/copen.png').then(useImage)
}

window.addEventListener('keydown', onkeydown(store))
window.addEventListener('keyup', onkeyup(store))

m.mount(document.body, () => ({
  view: () => App(store.getState(), store.dispatch)
}))
