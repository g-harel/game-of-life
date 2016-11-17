
// storing the values to loop around a cell
let neighbors = [
    [-1,-1],[-1, 0],[-1, 1],
    [ 0,-1],/*[00]*/[ 0, 1],
    [ 1,-1],[ 1, 0],[ 1, 1]
]

// board size
let width = 5;
let height = 5;

// initialize blank board
let board = (new Array(height)).fill((new Array(width).fill(false)));

// store the target cell opacity for mouseover
let changeto = 1;

// create board
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

// loop over all cells
function iterate(store, eval) {
    let temp = store.slice();
    for (let i = 0; i < height; ++i) {
        for (let j = 0; j < width; ++j) {
            temp[i][j] = eval(i, j, store);
        }
    }
    return temp;
}

// calculate the new generation
function gen(board) {
    return iterate(board, (i, j, store) => {
        let count = 0;
        for (let k = 0; k < neighbors.length; ++k) {
            count += +container[(height+(neighbors[k][0]+i)%height)%height][(width+(neighbors[k][1]+j)%width)%width];
        }
        if (board[i][j]) {
            if (count === 2 || count === 3) {
                return true;
            } else {
                return false;
            }
        } else {
            if (count === 3) {
                return true;
            } else {
                return false
            }
        }
    });
}

// randomize board
function reset(board) {
    return iterate(board, () => (Math.random() > 0.9));
}

// clear the board
function erase(board) {
    return iterate(board, () => false);
}