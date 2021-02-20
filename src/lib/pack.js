
// determines if rect `a` and rect `b` intersect
function intersects (a, b) {
  return a.x < b.x + b.width
      && a.x + a.width > b.x
      && a.y < b.y + b.height
      && a.y + a.height > b.y
}

// determines if the region specified by `rect` is clear of all other `rects`
function validate (rects, rect) {
  var a = rect
  for (var i = 0; i < rects.length; i++) {
    var b = rects[i]
    if (intersects(a, b)) {
      return false
    }
  }
  return true
}

// determines the percentage of whitespace area remaining in `layout`
function whitespace (layout) {
  var totalArea = layout.width * layout.height
  var rectArea = 0
  for (var i = 0; i < layout.rects.length; i++) {
    var rect = layout.rects[i]
    rectArea += rect.width * rect.height
  }
  return 1 - rectArea / totalArea
}

// determine the desirability of a given layout
function rate (layout) {
  return Math.max(layout.width, layout.height) + whitespace(layout)
}

// finds the smallest `[ width, height ]` tuple that contains all `rects`
function findBounds (rects) {
  var width = 0
  var height = 0
  for (var i = 0; i < rects.length; i++) {
    var rect = rects[i]
    var right = rect.x + rect.width
    var bottom = rect.y + rect.height
    if (right > width) {
      width = right
    }
    if (bottom > height) {
      height = bottom
    }
  }
  return { width: width, height: height }
}

// find all rect positions given a rect list
function findPositions (rects) {
  var positions = []
  for (var i = 0; i < rects.length; i++) {
    var rect = rects[i]
    for (var x = 0; x < rect.width; x++) {
      positions.push({
        x: rect.x + x,
        y: rect.y + rect.height
      })
    }
    for (var y = 0; y < rect.height; y++) {
      positions.push({
        x: rect.x + rect.width,
        y: rect.y + y
      })
    }
  }
  return positions
}

// finds the best location for a { width, height } tuple within the given layout
function findBestRect (layout, size) {
  var bestRect = {
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
  }

  if (!layout.rects.length) {
    return bestRect
  }

  var rect = {
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
  }

  var sandbox = {
    width: 0,
    height: 0,
    rects: layout.rects.slice()
  }

  var bestScore = Infinity
  var positions = findPositions(layout.rects)
  for (var i = 0; i < positions.length; i++) {
    var pos = positions[i]
    rect.x = pos.x
    rect.y = pos.y
    if (validate(layout.rects, rect)) {
      sandbox.rects[layout.rects.length] = rect

      var newSize = findBounds(sandbox.rects)
      sandbox.width = newSize.width
      sandbox.height = newSize.height

      var score = rate(sandbox)
      if (score < bestScore) {
        bestScore = score
        bestRect.x = rect.x
        bestRect.y = rect.y
      }
    }
  }

  return bestRect
}

// determine order of iteration (FFD)
function preorder (sizes) {
  var order = new Array(sizes.length)
  for (var i = 0; i < sizes.length; i++) {
    order[i] = i
  }

  // sort rects by area descending
  order.sort(function (a, b) {
    return sizes[b].width * sizes[b].height
         - sizes[a].width * sizes[a].height
  })

  return order
}

// rearrange rects to reflect the given iteration order
function reorder (items, order) {
  var newItems = items.slice()
  for (var i = 0; i < items.length; i++) {
    newItems[order[i]] = items[i]
  }
  return newItems
}

// packs { width, height } tuples into a layout { width, height, rects }
function pack (sizes) {
  var layout = {
    width: 0,
    height: 0,
    rects: []
  }

  if (!sizes.length) {
    return layout
  }

  var order = preorder(sizes)
  for (var i = 0; i < sizes.length; i++) {
    var size = sizes[order[i]]

    var rect = findBestRect(layout, size)
    layout.rects.push(rect)

    var bounds = findBounds(layout.rects)
    layout.width = bounds.width
    layout.height = bounds.height
  }

  layout.rects = reorder(layout.rects, order)
  return layout
}

module.exports = pack
