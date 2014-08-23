function Sudoku(state) {
  this.state = state;
  this.getSuccessors = function() {
    var empty = this._getFirstEmpty();
    var possibleVals = this._getPossibleVals(empty);

    var successors = [];
    for (var i = 0; i < possibleVals.length; i += 1) {
      var val = possibleVals[i];
      var successor = this._getSuccessor(empty, val);
      successors.push(successor);
    }
    return successors.reverse();
  }

  this._getFirstEmpty = function() {
    for (var row = 0; row < 9; row += 1){
      for (var col = 0; col < 9; col += 1) {
        if (this.state[row][col] === null)
          return [row, col];
      }
    }
    return null;
  }

  this._getRow = function(empty) {
    var x = empty[0];
    return this.state[x];
  }

  this._getCol = function(empty) {
    var y = empty[1];
    return _.map(this.state, function(row){ return row[y] });
  }

  this._getBox = function(empty) {
    var rowMin = Math.floor(empty[0] / 3) * 3,
        rowMax = rowMin + 3,
        colMin = Math.floor(empty[1] / 3) * 3,
        colMax = colMin + 3;

    var box = [];
    for (var x = rowMin; x < rowMax; x += 1) {
      for (var y = colMin; y < colMax; y += 1) {
        box.push(this.state[x][y]);
      }
    }
    return box;
  }

  this._getPossibleVals = function(empty) {
    var values = _.range(1,10),
        row = this._getRow(empty),
        col = this._getCol(empty),
        box = this._getBox(empty);
    _.remove(values, function(v){
      return _.indexOf(_.union(row, col, box), v) != -1;
    });
    return values;
  }

  this._getSuccessor = function(empty, val) {
    var successor = new Sudoku(_.cloneDeep(this.state));
    successor.state[empty[0]][empty[1]] = val;
    return successor
  }

  this.printState = function() {
    var html = _.reduce(this.state, function(agg, row) {
      var rowString = _.reduce(row, function(agg, el) {
        var elString = el? '' + el : '&nbsp;';
        return agg + '<div class="block">' + '<p>' + elString + '</p>' + '</div>';
      }, '');
      return agg + '<div class="row">' + rowString + '</div>';
    }, '');
    $('#sudoku-container').html(html);
  }

  this.isFinalState = function() {
    return this._getFirstEmpty() === null;
  }
}

function DFS(startState) {
  fringe = [startState]
  while (fringe.length){
    state = fringe.pop();
    state.printState();
    if (state.isFinalState())
      return state;
    else {
      successors = state.getSuccessors();
      fringe = fringe.concat(successors);
    }
  }

  throw("No solution");
}

var startState = new Sudoku(
  [[null, null, null, null, null, 8, 9, null, 2],
   [6, null, 4, 3, null, null, null, null, null],
   [null, null, null, 5, 9, null, null, null, null],
   [null, null, 5, 7, null, 3, null, null, 9],
   [7, null, null, null, 4, null, null, null, null],
   [null, null, 9, null, null, null, 3, null, 5],
   [null, 8, null, null, null, 4, null, null, null],
   [null, 4, 1, null, null, null, null, 3, null],
   [2, null, null, 1, 5, null, null, null, null]]
);

startState.printState();
// var solution = DFS(startState);

