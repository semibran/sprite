import { h, text, app } from 'hyperapp'

app({
  init: { image: null, sprites: [] },
  view: (image) =>
    h('main', {}, [
      h('aside', { class: 'sidebar' }),
      h('div', { class: 'editor' }, [
        h('button', {}, [
          h('span', { class: 'icon material-icons-round' },
            text('publish')),
          text('Select an image...')
        ])
      ])
    ]),
  node: document.getElementById('app')
})
