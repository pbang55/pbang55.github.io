(function($, _){
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

    this.isFinalState = function() {
      return this._getFirstEmpty() === null;
    }
  }

  function DFS(startState) {

    this.exploreNode = function(){
      if (this.fringe.length){
        this.currentState = this.fringe.pop();
        this.nodesExplored += 1;
        if (this.currentState.isFinalState()){
          return "solved";
        }
        else {
          successors = this.currentState.getSuccessors();
          this.fringe = this.fringe.concat(successors);
        }
      }
      else return "failed";
    }

    this.exploreNodes = function(){
      for (var x = 0; x < 1000; x += 1) {
        var result = this.exploreNode();
        if (result === "solved" || result === "failed") {
          this.printState(this.currentState.state);
          clearInterval(this.id);
          return;
        }
      }
      this.printState(this.currentState.state);
    }

    this.printState = function(state) {
      var html = _.reduce(state, function(agg, row) {
        var rowString = _.reduce(row, function(agg, el) {
          var elString = el? '' + el : '&nbsp;';
          return agg + '<div class="block">' + '<p>' + elString + '</p>' + '</div>';
        }, '');
        return agg + '<div class="row">' + rowString + '</div>';
      }, '');

      html = _.template('<%= html %><p>Nodes Explored: <%= nodesExplored %></p>')({
        html: html,
        nodesExplored: this.nodesExplored
      });
      $('#sudoku-container').html(html);
    }

    this.fringe = [startState];
    this.currentState = null;
    this.nodesExplored = 0;
    this.id = setInterval( this.exploreNodes, 5);

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

  var solution = DFS(startState);

})(jQuery, _);
