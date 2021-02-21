
const download = (url, filename) => {
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

export default download
