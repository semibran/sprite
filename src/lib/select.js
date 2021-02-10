export default function select (items, i, opts) {
  const idx = items.indexOf(i)
  const prev = items[items.length - 1]
  if (opts.shift && !opts.ctrl && prev != null && prev !== i) {
    const dir = i > prev ? 1 : -1
    for (let j = prev; j !== i;) {
      j += dir
      if (items.indexOf(j) === -1) {
        items.push(j)
      }
    }
  } else if (opts.ctrl && !opts.shift) {
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
