export default function rectContains (rect, x, y) {
  return x > rect.x &&
         y > rect.y &&
         x < rect.x + rect.width &&
         y < rect.y + rect.height
}
