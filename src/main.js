import { h, text, app } from 'hyperapp'

app({
  init: { image: null, sprites: [] },
  view: (image) =>
    h('main', {}, [
      h('div', { class: 'editor' }),
      h('aside', { class: 'sidebar' })
    ]),
  node: document.getElementById('app')
})
