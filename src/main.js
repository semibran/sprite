import { h, text, app } from 'hyperapp'

const uploadFx = (dispatch, props) => {
  const image = new Image()
  image.src = URL.createObjectURL(props.file)
  image.onload = () => {
    dispatch(image)
  }
}

const upload = (props) =>
  [uploadFx, props]

const UploadImage = (state, evt) => [
  state,
  upload({
    file: evt.target.files[0],
    action: SetImage
  })
]

const SetImage = (state, image) =>
  ({ ...state, image })

app({
  init: { image: null, sprites: [] },
  view: ({ image }) => {
    console.log(image)
    return h('main', { class: 'app' }, [
      h('aside', { class: 'sidebar' }),
      h('div', { class: 'editor' }, [
        !image
          ? h('input', {
              id: 'upload',
              type: 'file',
              accept: 'image/png, image/gif',
              multiple: false,
              onchange: UploadImage
            })
          : text(image)
        // h('button', {}, [
        //   h('span', { class: 'icon material-icons-round' },
        //     text('publish')),
        //   text('Select an image...')
        // ])
      ])
    ])
  },
  node: document.getElementById('app')
})
