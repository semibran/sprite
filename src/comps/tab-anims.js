
import m from 'mithril'
import extract from 'img-extract'
import Thumb from './thumb'

export default function AnimsTab (state, dispatch) {
  const image = state.image
  return state.anims.list.length
    ? m('.sidebar-content', state.anims.list.map((anim, i) => {
        const selected = state.anims.selects.includes(i)
        return m('.entry', {
          key: i + '-' + anim.name,
          class: selected ? '-select' : null,
          onclick: (evt) => !selected && dispatch('selectAnim', {
            index: i,
            opts: {
              ctrl: evt.ctrlKey || evt.metaKey,
              shift: evt.shiftKey
            }
          })()
        }, [
          m('.thumb.-entry', [
            anim.frames.length && anim.frames[0].sprite
              ? m(Thumb, { image: extract(image, ...anim.frames[0].sprite.rect) })
              : null
          ]),
          selected && state.anims.editname
            ? m.fragment({
                oncreate: (vnode) => {
                  let blurred = false
                  const input = vnode.dom
                  input.select()

                  // HACK: setting listener directly on node always auto redraws (evt.render does nothing)
                  input.addEventListener('keyup', (evt) => evt.key === 'Enter' && onblur(evt))
                  input.addEventListener('blur', onblur)

                  function onblur (evt) {
                    if (blurred) return
                    dispatch('renameAnim', { name: evt.target.value })()
                    requestAnimationFrame(m.redraw)
                    blurred = true
                  }
                }
              }, [
                m('input.entry-name', { value: anim.name })
              ])
            : m('.entry-name',
              { ondblclick: dispatch('startRenameAnim') },
              anim.name)
        ])
      }))
    : m('.sidebar-content.-empty', [
      m('.sidebar-notice', [
        'No states registered.',
        m('button.-create', {
          onclick: dispatch('createAnim')
        }, [
          m('span.icon.material-icons-round', 'add'),
          'Create'
        ])
      ])
    ])
}
