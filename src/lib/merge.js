export default function merge (rects) {
  let left = Infinity
  let top = Infinity
  let right = 0
  let bottom = 0

  for (let i = 0; i < rects.length; i++) {
    if (rects[i][0] < left) {
      left = rects[i][0]
    }

    if (rects[i][1] < top) {
      top = rects[i][1]
    }

    if (rects[i][0] + rects[i][2] > right) {
      right = rects[i][0] + rects[i][2]
    }

    if (rects[i][1] + rects[i][3] > bottom) {
      bottom = rects[i][1] + rects[i][3]
    }
  }

  const width = right - left + 1
  const height = bottom - top + 1
  return [left, top, width, height]
}
