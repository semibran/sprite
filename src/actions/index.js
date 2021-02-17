
import extractImage from 'img-extract'
import cloneImage from '../lib/img-clone'
import sliceCanvas from '../lib/slice'
import cache from '../app/cache'

export * from '../views/editor-sprites'
export * from '../views/timeline'
export * from '../views/timeline-controls'
export * from '../views/panel-sprites'
export * from '../views/panel-props'

export const useImage = (state) => {
  state.anims = []
  if (state.sprites.length) {
    cache.sprites = state.sprites.map((sprite) =>
      extractImage(cache.image, ...sprite.rect))
    return state
  } else {
    const canvas = cloneImage(cache.image)
    const rects = sliceCanvas(canvas)
    cache.sprites = rects.map((rect) => extractImage(cache.image, ...rect))
    return {
      ...state,
      sprites: rects.map((rect, i) => (
        { rect, name: `${state.project.name.toLowerCase()}_${i}` }
      ))
    }
  }
}
