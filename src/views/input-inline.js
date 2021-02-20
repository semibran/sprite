
import m from 'mithril'

const InlineInput = ({ id, value, min, max, oninput }, children) => {
  const onrender = (vnode) => {
    const input = vnode.dom
    if (document.activeElement !== input) {
      input.value = value
    }
  }

  return m('label.section-field.-inline', { for: id }, [
    m.fragment({ oncreate: onrender, onupdate: onrender }, [
      m('input.field-value', {
        type: 'number',
        id,
        min,
        max,
        oninput: (evt) => {
          const input = evt.target
          if (parseInt(input.value) < min) {
            input.value = min
          } else if (parseInt(input.value) > max) {
            input.value = max
          }

          const duration = parseInt(input.value)
          if (duration) {
            input.nextSibling.innerText = duration
            oninput && oninput(evt)
          }
        },
        onkeydown: (evt) => {
          const input = evt.target
          if (evt.code === 'Enter') {
            input.blur()
          }
        }
      })
    ]),
    ...children
  ])
}

export default InlineInput
