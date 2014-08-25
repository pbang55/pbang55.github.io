(function($, _){
  function Sudoku(board) {

    this.__init__ = function() {
      this.board = _.map(board, function(row){
        return _.map(row, function(num){
          return {
            num: num,
            original: true
          }
        })
      })
    };
    this.__init__();

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
          if (this.board[row][col].num === null)
            return {row: row, col: col};
        }
      }
      return null;
    }

    this._getRowNums = function(empty) {
      var x = empty.row;
      return _.map(this.board[x], function(el) { return el.num; });
    }

    this._getColNums = function(empty) {
      var y = empty.col;
      return _.map(this.board, function(row){ return row[y].num; });
    }

    this._getBoxNums = function(empty) {
      var rowMin = Math.floor(empty.row / 3) * 3,
          rowMax = rowMin + 3,
          colMin = Math.floor(empty.col / 3) * 3,
          colMax = colMin + 3;

      var box = [];
      for (var x = rowMin; x < rowMax; x += 1) {
        for (var y = colMin; y < colMax; y += 1) {
          box.push(this.board[x][y].num);
        }
      }
      return box;
    }

    this._getPossibleVals = function(empty) {
      var values = _.range(1,10),
          row = this._getRowNums(empty),
          col = this._getColNums(empty),
          box = this._getBoxNums(empty);
      _.remove(values, function(v){
        return _.indexOf(_.union(row, col, box), v) != -1;
      });
      return values;
    }

    this._getSuccessor = function(empty, val) {
      var successor = _.cloneDeep(this);
      successor.board[empty.row][empty.col] = {
        num: val,
        original: false
      };
      return successor
    }

    this.isFinalState = function() {
      return this._getFirstEmpty() === null;
    }
  }

  function DepthFirstSearchModule(startState) {

    this._exploreNode = function(){
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

    this._exploreNodes = function(){
      var speed = parseInt( $('#speed-selector').val() );
      var numberOfNodes = speed * this.INTERVAL / 1000;
      for (var x = 0; x < numberOfNodes; x += 1) {

        var result = this._exploreNode();
        if (result === "solved" || result === "failed") {
          this._printState(this.currentState);
          clearInterval(this.id);
          return;
        }
      }
      this._printState(this.currentState);
    }

    this._printState = function(state) {
      var html = _.reduce(state.board, function(agg, row) {
        var rowString = _.reduce(row, function(agg, el) {
          var elString = el.num? '' + el.num : '&nbsp;';
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

    this.search = function() {
      this.fringe = [startState];
      this.currentState = null;
      this.nodesExplored = 0;
      this.INTERVAL = 100;
      this.id = setInterval( this._exploreNodes.bind(this), this.INTERVAL );
    }
  }

  function initialize() {
    function updateSpeed(){
      var speed = $('#speed-selector').val();
      $('#speed').text(speed);
    };

    $('#speed-selector').on('input', updateSpeed );

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
    var DFSModule = new DepthFirstSearchModule(startState);
    DFSModule.search();
  }

  initialize();

})(jQuery, _);
