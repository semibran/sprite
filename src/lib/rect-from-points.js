export default function rectFromPoints ({ x: x1, y: y1 }, { x: x2, y: y2 }) {
  if (x2 < x1) {
    [x1, x2] = [x2, x1]
  }

  if (y2 < y1) {
    [y1, y2] = [y2, y1]
  }

  return {
    x: x1,
    y: y1,
    width: x2 - x1 + 1,
    height: y2 - y1 + 1
  }
}
