function Sudoku(state) {
	this.state = state;
	this.getSuccessors = function() {
		return [new Sudoku(this.state + 1)];
	}
	this.isFinalState = function() {
		return this.state == 10;
	}
}

function DFS(problem) {
	fringe = [problem]
	while (fringe.length){
		debugger
		state = fringe.pop();
		if (state.isFinalState())
			return state;
		else {
			successors = state.getSuccessors();
			_.extend(fringe, successors);
		}
	}

	throw("No solution");
}
