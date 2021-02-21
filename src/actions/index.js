
import extractImage from 'img-extract'
import cloneImage from '../lib/img-clone'
import sliceCanvas from '../lib/slice'
import cache from '../app/cache'

export * from './sprite'
export * from './anim'
export * from './frame'
export * from '../views/editor-sprites'
export * from '../views/editor-anims'
export * from '../views/timeline'
export * from '../views/timeline-controls'
export * from '../views/panel-sprites'
export * from '../views/banner'
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

export const exportData = (dispatch, getState) => {
  const state = getState()

  const sprites = state.sprites.list.map((sprite) => {
    const { x, y, width, height } = sprite.rect
    return [x, y, width, height]
  })

  const anims = state.anims.list.reduce((anims, anim) => ({
    ...anims,
    [anim.name]: {
      next: -1,
      frames: anim.frames.map((frame) => ({
        sprite: frame.sprite,
        duration: frame.duration * anim.speed,
        origin: [frame.origin.x, frame.origin.y]
      }))
    }
  }), {})

  const data = { sprites, anims }
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const filename = `${state.project.name}.json`

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.addEventListener('click', function onclick () {
    requestAnimationFrame(() => {
      URL.revokeObjectURL(url)
      a.removeEventListener('click', onclick)
    })
  })
  a.click()
}
