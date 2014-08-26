(function($, _){

  var Settings = {
    INTERVAL: 100,

    ui: {
      sudokuContainer: '#sudoku-container',
      speedText: '#speed',
      speedSelector: '#speed-selector',
      boardOptions: 'input[name=board]',
      startButton: '#start-button',
      resetButton: '#reset-button'
    },

    sudokuBoards: {
      board1: [
        [6,null,null,null,null,5,null,3,null],
        [4,8,null,2,7,null,null,null,null],
        [null,null,null,8,null,1,null,null,9],
        [null,null,null,null,1,null,8,4,null],
        [9,4,null,null,3,null,null,1,5],
        [null,3,1,null,2,null,null,null,null],
        [3,null,null,6,null,2,null,null,null],
        [null,null,null,null,5,7,null,8,2],
        [null,5,null,1,null,null,null,null,6]
      ],
      board2: [
        [1,null,null,null,null,null,4,null,null],
        [7,3,9,null,8,null,2,null,null],
        [6,null,4,3,null,null,null,null,null],
        [null,null,2,5,null,null,7,null,9],
        [null,9,1,7,null,4,3,6,null],
        [8,null,3,null,null,6,5,null,null],
        [null,null,null,null,null,7,6,null,3],
        [null,null,7,null,6,null,8,9,2],
        [null,null,6,null,null,null,null,null,5]
      ],
      board3: [
        [null,null,null,8,null,null,null,null,5],
        [3,7,null,null,null,null,null,8,null],
        [null,null,null,4,null,null,null,null,7],
        [8,null,7,6,null,2,null,1,3],
        [null,2,null,null,null,null,null,4,null],
        [5,1,null,3,null,4,2,null,8],
        [2,null,null,null,null,6,null,null,null],
        [null,8,null,null,null,null,null,5,4],
        [9,null,null,null,null,3,null,null,null]
      ],
      board4: [
        [null,9,8,null,null,null,4,7,null],
        [null,null,null,null,null,null,1,null,5],
        [null,null,null,7,null,null,9,6,null],
        [null,6,null,null,null,null,null,9,null],
        [null,null,null,1,null,null,null,2,null],
        [null,null,3,null,2,4,null,null,null],
        [4,null,null,null,null,null,null,null,8],
        [2,null,null,null,5,9,null,null,null],
        [null,null,null,null,7,null,null,1,null]
      ]
    }
  }

  function Application() {

    this.Sudoku = function(board) {

      this.__init__ = function() {
        this.board = board;
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
            if (this.board[row][col] === null)
              return {row: row, col: col};
          }
        }
        return null;
      }

      this._getRowNums = function(empty) {
        var x = empty.row;
        return this.board[x];
      }

      this._getColNums = function(empty) {
        var y = empty.col;
        return _.map(this.board, function(row){ return row[y]; });
      }

      this._getBoxNums = function(empty) {
        var rowMin = Math.floor(empty.row / 3) * 3,
            rowMax = rowMin + 3,
            colMin = Math.floor(empty.col / 3) * 3,
            colMax = colMin + 3;

        var box = [];
        for (var x = rowMin; x < rowMax; x += 1) {
          for (var y = colMin; y < colMax; y += 1) {
            box.push(this.board[x][y]);
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
          return _.indexOf(row, v) != -1 || _.indexOf(col, v) != -1 || _.indexOf(box, v) != -1;
        });
        return values;
      }

      this._getSuccessor = function(empty, val) {
        var successor = _.cloneDeep(this);
        successor.board[empty.row][empty.col] = val;
        return successor
      }

      this.isFinalState = function() {
        return this._getFirstEmpty() === null;
      }
    }

    this.DepthFirstSearchModule = function(startState) {

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
        var numberOfNodes = speed * Settings.INTERVAL / 1000;
        for (var x = 0; x < numberOfNodes; x += 1) {

          var result = this._exploreNode();
          if (result === "solved" || result === "failed") {
            this._printState(this.currentState);
            this.stopSearch();
            return;
          }
        }
        this._printState(this.currentState);
      }

      this._printState = function(state) {
        var board = state.board;
        var $html = $('<div></div>').addClass('sudoku');
        for (var row = 0; row < 9; row += 1) {
          var $rowHtml = $('<div></div>').addClass('row' + row);
          for (var col = 0; col < 9; col += 1) {
            var num = board[row][col]
            var elString = num ? num : '&nbsp;';
            var $blockHtml = $('<div></div>').addClass('block')
                                             .addClass('col' + col)
                                             .html('<p>' + elString + '</p>');
            $rowHtml.append($blockHtml);
          }
          $html.append($rowHtml);
        }

        $nodesHtml = $('<div></div>').addClass('nodes-explored')
                                     .html('<p>Nodes Explored: ' + this.nodesExplored + '</p>');

        $html.append($nodesHtml);
        $(Settings.ui.sudokuContainer).html($html);

      }

      this.__init__ = function() {
        this.nodesExplored = 0;
      };
      this.__init__();

      this.search = function() {
        this.fringe = [startState];
        this.currentState = null;

        this.id = setInterval( this._exploreNodes.bind(this), Settings.INTERVAL );
      }

      this.stopSearch = function() {
        clearInterval(this.id);
      }
    }

    this.startState = null;
    this.DFSModule = null;

    this._updateSpeedText = function(){
      var speedText = $(Settings.ui.speedSelector).val();
      $(Settings.ui.speedText).text(speedText);
    };

    this._start = function() {
      this.DFSModule.search();
    }

    this._reset = function() {
      this.DFSModule.stopSearch();
      this.DFSModule.nodesExplored = 0;
      this.DFSModule._printState(this.startState);
    }

    this._initializeBoard = function(boardKey) {
      this.startState = new this.Sudoku(Settings.sudokuBoards[boardKey]);
      this.DFSModule = new this.DepthFirstSearchModule(this.startState);
      this.DFSModule._printState(this.startState);
    }

    this._changeBoard = function() {
      this._reset();
      var boardKey = $(Settings.ui.boardOptions + ':checked').val();
      this._initializeBoard(boardKey);
    }

    this.initialize = function(){

      this._initializeBoard('board1');

      $(Settings.ui.speedSelector).on('input', this._updateSpeedText );
      $(Settings.ui.startButton).on('click', this._start.bind(this) );    
      $(Settings.ui.resetButton).on('click', this._reset.bind(this) );
      $(Settings.ui.boardOptions).on('change', this._changeBoard.bind(this) );  
    }
  };



  var application = new Application();
  application.initialize();

})(jQuery, _);
