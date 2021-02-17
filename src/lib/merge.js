export default function merge (rects) {
  let left = Infinity
  let top = Infinity
  let right = 0
  let bottom = 0

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]

    if (rect.x < left) {
      left = rect[0]
    }

    if (rect.y < top) {
      top = rect[1]
    }

    if (rect.x + rect.width > right) {
      right = rect.x + rect.width
    }

    if (rect.y + rect.height > bottom) {
      bottom = rect.y + rect.height
    }
  }

  return {
    x: left,
    y: top,
    width: right - left + 1,
    height: bottom - top + 1
  }
}
