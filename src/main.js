
import m from 'mithril'
import { createStore, applyMiddleware, compose } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import loadImage from 'img-load'
import thunk from './lib/thunk'
import reduce from './lib/combine-reducers'
import App from './views/app'
import cache from './app/cache'
import * as actions from './actions'

const initialState = {
  project: { name: 'Untitled' },
  window: null,
  menu: false,
  select: {
    target: 'sprites',
    items: []
  },
  sprites: [],
  spriteEditor: {
    pos: { x: 0, y: 0 },
    scale: 1
  },
  anims: [],
  animEditor: {
    pos: { x: 0, y: 0 },
    scale: 1
  },
  panels: {
    sprites: true,
    props: true,
    timeline: true
  },
  timeline: {
    pos: 0,
    subpos: 0,
    selects: [],
    playing: false,
    repeat: false,
    onionskin: false
  }
}

Object.assign(cache, {
  image: null,
  timeout: null,
  sprites: [],
  messages: {}
})

const persistConfig = { key: 'root', storage }
const reducer = persistReducer(persistConfig, reduce(actions, initialState))
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const enhancer = composeEnhancers(applyMiddleware(thunk))
const store = createStore(reducer, enhancer)
window.persistor = persistStore(store)
store.subscribe(m.redraw)

loadImage('../tmp/copen.png').then((image) => {
  cache.image = image
  store.dispatch({ type: 'useImage' })
})

m.mount(document.body, () => ({
  view: () => App(store.getState(), store.dispatch)
}))
