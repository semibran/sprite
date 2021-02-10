export default function select (items, i, evt) {
  if (evt.detail === 2) {
    return false
  }
  const shift = evt.shiftKey
  const ctrl = evt.ctrlKey || evt.metaKey
  const idx = items.indexOf(i)
  const prev = items[items.length - 1]
  if (shift && !ctrl && prev != null && prev !== i) {
    const dir = i > prev ? 1 : -1
    for (let j = prev; j !== i;) {
      j += dir
      if (items.indexOf(j) === -1) {
        items.push(j)
      }
    }
  } else if (ctrl && !shift) {
    if (idx === -1) {
      items.push(i)
    } else {
      items.splice(idx, 1)
    }
  } else if (idx === -1 || items.length > 1) {
    items[0] = i
    items.length = 1
  } else {
    items.length = 0
  }
  return true
}
