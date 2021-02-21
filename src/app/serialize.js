
const serialize = (state) => {
  const registry = []

  const anims = state.anims.list.reduce((anims, anim) => ({
    ...anims,
    [anim.name]: {
      next: -1,
      frames: anim.frames.map((frame) => {
        if (registry.indexOf(frame.sprite) === -1) {
          registry.push(frame.sprite)
        }
        return {
          sprite: frame.sprite,
          duration: frame.duration * anim.speed,
          origin: [frame.origin.x, frame.origin.y]
        }
      })
    }
  }), {})

  const sprites = registry.map((id) => {
    const sprite = state.sprites.list[id]
    const { x, y, width, height } = sprite.rect
    return [x, y, width, height]
  })

  return JSON.stringify({ sprites, anims })
}

export default serialize
