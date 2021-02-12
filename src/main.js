
import m from 'mithril'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import loadImage from 'img-load'
import reduce from './lib/combine-reducers'
import App from './comps/app'
import cache from './app/cache'
import * as actions from './app/actions'

const initialState = {
  sprname: 'untitled',
  tab: 'sprites',
  window: null,
  sprites: {
    list: [],
    selects: [],
    editname: false
  },
  anims: {
    list: [],
    selects: [],
    editname: false,
    tab: 'anim'
  },
  timeline: {
    pos: 0,
    selects: [],
    playing: false,
    repeat: false,
    onionskin: false
  }
}

Object.assign(cache, {
  image: null,
  timeout: null,
  images: []
})

const reducers = reduce(actions, initialState)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const enhancer = composeEnhancers(applyMiddleware(thunk))
const store = createStore(reducers, enhancer)
store.subscribe(m.redraw)

loadImage('../tmp/test.png').then((image) => {
  cache.image = image
  store.dispatch({ type: 'setImage' })
})

m.mount(document.body, () => ({
  view: () => App({ ...store.getState(), cache },
    (type, payload) => store.dispatch({ type, payload }))
}))
