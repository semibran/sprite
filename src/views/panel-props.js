
import m from 'mithril'
import Panel from './panel'

export const showProps = (state) => ({
  ...state,
  panels: { ...state.panels, props: true }
})

export const hideProps = (state) => ({
  ...state,
  panels: { ...state.panels, props: false }
})

export default function PropsPanel (state, dispatch) {
  return Panel({
    id: 'props',
    name: 'Properties',
    hidden: !state.panels.props,
    onshow: () => dispatch(showProps),
    onhide: () => dispatch(hideProps)
  })
}
