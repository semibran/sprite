
export default function createAnim (duration) {
  let done = false
  let time = 0
  return function update () {
    if (done) return -1
    const t = time / (duration - 1)
    if (++time === duration) {
      done = true
    }
    return t
  }
}
