
import extractImage from 'img-extract'
import cloneImage from '../lib/img-clone'
import sliceCanvas from '../lib/slice'
import download from '../lib/download'
import cache from '../app/cache'
import serialize from '../app/serialize'

export * from './sprite'
export * from './anim'
export * from './frame'
export * from '../views/editor-sprites'
export * from '../views/editor-anims'
export * from '../views/timeline'
export * from '../views/timeline-controls'
export * from '../views/panel-sprites'
export * from '../views/panel-props'

export const useImage = (state) => {
  if (state.sprites.list.length) {
    cache.sprites = state.sprites.list.map(({ rect }) =>
      extractImage(cache.image, rect.x, rect.y, rect.width, rect.height))
    return state
  } else {
    const canvas = cloneImage(cache.image)
    const rects = sliceCanvas(canvas)
    cache.sprites = rects.map((rect) =>
      extractImage(cache.image, rect.x, rect.y, rect.width, rect.height))
    localStorage.setItem('image', canvas.toDataURL())
    return {
      ...state,
      sprites: {
        ...state.sprites,
        list: rects.map((rect, i) => (
          { rect, name: `${state.project.name.toLowerCase()}_${i}` }
        ))
      }
    }
  }
}

export const prepareExport = (dispatch, getState) => {
  const state = getState()
  const blob = new Blob([serialize(state)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  cache.url = url
  return url
}

export const exportData = (dispatch, getState) => {
  const state = getState()
  const url = cache.url || prepareExport(dispatch, getState)
  const filename = `${state.project.name}.json`
  download(url, filename)
}
