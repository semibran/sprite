
import m from 'mithril'

export default function Thumb (image) {
  return m.fragment({
    oncreate: (vnode) => {
      const canvas = vnode.dom
      const context = canvas.getContext('2d')
      canvas.width = image.width
      canvas.height = image.height
      context.drawImage(image, 0, 0)
    }
  }, m('canvas'))
}
