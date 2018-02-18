const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']

function GithubGameOfLife() {
  const rectColumns = Array.from(
    document.querySelectorAll('.js-calendar-graph-svg g g')
  )
  this.rectMatrix = rectColumns.map(col =>
    Array.from(col.querySelectorAll('rect'))
  )
  this.model = this.rectMatrix.map(col =>
    col.map(rect => colors.indexOf(rect.attributes.fill.value))
  )
  this.initialModel = this.model
  this.isRunning = false
}

GithubGameOfLife.prototype.run = function run() {
  this.tick()
  this.interval = setInterval(this.tick.bind(this), 1000)
  this.isRunning = true
}

GithubGameOfLife.prototype.stop = function stop() {
  clearInterval(this.interval)
  this.model = this.initialModel
  this.isRunning = false
  this.render()
}

GithubGameOfLife.prototype.tick = function tick() {
  this.updateModel()
  this.render()
}

GithubGameOfLife.prototype.updateModel = function updateModel() {
  this.forEachCell((colNum, rowNum) => {
    const age = this.model[colNum][rowNum]
    const neighbours = this.getNeighbourCount(colNum, rowNum)
    if (age) {
      this.model[colNum][rowNum] =
        neighbours === 2 || neighbours === 3 ? age + 1 : 0
    } else {
      this.model[colNum][rowNum] = neighbours === 3 ? age + 1 : 0
    }
  })
}

GithubGameOfLife.prototype.getNeighbourCount = function getNeighbourCount(
  colNum,
  rowNum
) {
  let count = 0
  for (let i = colNum - 1; i <= colNum + 1; i++) {
    for (let j = rowNum - 1; j <= rowNum + 1; j++) {
      const isValid =
        0 <= i &&
        i < this.model.length &&
        0 <= j &&
        j < this.model[i].length &&
        !(i === colNum && j === rowNum)

      if (isValid) {
        count += this.model[i][j] > 0 ? 1 : 0
      }
    }
  }
  return count
}

GithubGameOfLife.prototype.render = function render() {
  this.forEachCell((colNum, rowNum) => {
    const rect = this.rectMatrix[colNum][rowNum]
    rect.attributes.fill.value = colors[Math.min(this.model[colNum][rowNum], 4)]
  })
}

GithubGameOfLife.prototype.forEachCell = function forEachCell(cb) {
  for (let colNum = 0; colNum < this.model.length; colNum++) {
    for (let rowNum = 0; rowNum < this.model[colNum].length; rowNum++) {
      cb(colNum, rowNum)
    }
  }
}

const game = new GithubGameOfLife()
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'clicked_browser_action') {
    if (game.isRunning) {
      game.stop()
    } else {
      game.run()
    }
  }
})
