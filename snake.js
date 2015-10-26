
const BOARD_SIZE = 20; 
const CELL_SIZE = 20;

const FPS = 6;  // How fast are we playing?
const SNAKE_START_SIZE = 3;

var board = [];
var snakeCells = [];
var fruitCell;
var stage;

class Cell {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
}

// Which direction is the snake moving in?
var snakeDX, snakeDY;

function isOccupied(x,y) {
	if (fruitCell !== undefined && x === fruitCell.x && y === fruitCell.y) {
		return true;
	}
	snakeCells.forEach(function(cell) {
		if (x === cell.x && y === cell.y) {
			return true;
		}
	});
	
	// fallthrough: nothing matched, the cell isn't occupied
	return false;
}

// Pick a cell on the board that isn't the fruit or the snake
function getRandomEmptyCell() {
	var rx = 0, ry = 0;
	do {
		rx = Math.round(Math.random() * BOARD_SIZE) % BOARD_SIZE;
		ry = Math.round(Math.random() * BOARD_SIZE) % BOARD_SIZE;
	} while (isOccupied(rx,ry));
	return new Cell(rx,ry);
}

function addFruit() {
	fruitCell = getRandomEmptyCell();
}

function addSnake() {
	// Create random vertical snake
	var snakeHead;
	do {
		snakeHead = getRandomEmptyCell();
	} while (snakeHead.y > BOARD_SIZE - 3);
	
	snakeCells.length = 0;
	snakeCells.push(snakeHead);
	snakeCells.push(new Cell(snakeHead.x, snakeHead.y + 1));
	snakeCells.push(new Cell(snakeHead.x, snakeHead.y + 2));
	
	snakeDX = 0; snakeDY = -1;
}

// Create an empty board, pick a random cell for fruit, and random cells for the snake. 
function init() {
	for (var i = 0; i < BOARD_SIZE; ++i) {
		var boardRow = new Array(BOARD_SIZE);
		board[i] = boardRow;
	}

	var canvas = document.getElementById("canvas");
	stage = new createjs.Stage(canvas);
	
	addFruit();
	addSnake();
	
	createjs.Ticker.setFPS(FPS); // yep, slow, 2 frames per second
	createjs.Ticker.addEventListener("tick", tick);
}

function addSquare(color, j, i) {
	var square = new createjs.Shape();
	square.graphics.beginFill(color).drawRect(0, 0, CELL_SIZE, CELL_SIZE);
	square.x = (j + 1) * CELL_SIZE;
	square.y = (i + 1) * CELL_SIZE;
	stage.addChild(square);
}

function drawBoard() {
	// TODO: find a better way to do this?
	// Get rid of everything and start from scratch!
	stage.removeAllChildren();
	
	// Draw an empty board
	for (var i = 0; i < BOARD_SIZE; ++i) {
		for (var j = 0; j < BOARD_SIZE; ++j) {
			addSquare("BLUE", j, i);
		}
	}	
	
	// Overlay fruit and snake
	addSquare("RED", fruitCell.x, fruitCell.y);
	snakeCells.forEach(function(c) {addSquare("YELLOW", c.x, c.y);});

	stage.update();
	
	// Setup listeners for keyboard arrows
	document.onkeydown = handleKey;
}

function handleKey(event) {
	const _left = 37;
	const _up = 38;
	const _right = 39;
	const _down = 40;
	switch (event.keyCode) {
		case _left:
		  snakeDX = -1; snakeDY = 0;  break;
		case _right:
		  snakeDX = 1;  snakeDY = 0;  break;
		case _up:
		  snakeDX = 0;  snakeDY = -1; break;
		case _down:
		  snakeDX = 0;  snakeDY = 1;  break;
	}
}

function tick(e) {
	moveSnake();
	drawBoard();
}

function moveSnake() {
	// Create a new 'head' based on the previous head, then 
	// get rid of the tail element.
	const headX = (snakeCells[0].x + snakeDX + BOARD_SIZE) % BOARD_SIZE;
	const headY = (snakeCells[0].y + snakeDY + BOARD_SIZE) % BOARD_SIZE;
	
	// See if we hit either the fruit or ourself
	const hitFruit = (headX === fruitCell.x && headY === fruitCell.y);
	const hitSnake = snakeCells.some(function(v,i,arr) {
		return (v.x === headX && v.y === headY);
	});
	
	if (hitSnake) {
		// Start all over again!
		addSnake();
		return;
	}

    // If we didn't hit ourself, move on	
	snakeCells.unshift(new Cell(headX, headY));
	
	if (hitFruit) {
		// If we hit the fruit, make a new fruit	
		addFruit();
	} else {
		// Otherwise, get rid of the snake's last cell
		snakeCells.pop();
	}
}

function Main() {
	init();
}