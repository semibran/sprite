import m from 'mithril'

export default {
  oncreate: vnode => {
    const image = vnode.attrs.image
    const canvas = vnode.dom
    const context = canvas.getContext('2d')
    canvas.width = image.width
    canvas.height = image.height
    context.drawImage(image, 0, 0)
  },
  view: () =>
    m('canvas')
}
