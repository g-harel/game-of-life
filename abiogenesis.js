
// storing the values to loop around a cell
let neighbors = [
    [-1,-1],[-1, 0],[-1, 1],
    [ 0,-1],/*[00]*/[ 0, 1],
    [ 1,-1],[ 1, 0],[ 1, 1]
]

// board size
let width = 60;
let height = 60;

// initialize blank board of HEIGHTxWIDTH
let board = (new Array(height)).fill(new Array(width));

// store the target cell opacity for mouseover
let changeto = 1;

// create canvas and fetch imageData 
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

window.onclick =  function() {
    let newboard = gen(board);
    board = newboard;
    draw(newboard);
}

let count = 500;
function genloop() {
    board = gen(board);
    draw(board);
    if (count !== 0) {
        --count;
        requestAnimationFrame(genloop);
    }
}
board = reset(board)
genloop();

// draws cells to canvas with fillRect
function draw(board) {
    let cellheight = canvas.height/height >> 0;
    let cellwidth = canvas.width/width >> 0;
    let m = height-1;
    while (m + 1) {
        let n = width-1;
        let verticalpos = m*cellheight;
        while (n + 1) {
            context.fillStyle = board[m][n]?'black':'white';
            context.fillRect(verticalpos, n*cellwidth, cellheight, cellwidth);
            --n;
        }
        --m;
    }
}

// map over all cells of the internal board
function map2d(store, eval) {
    let temp = store.slice();
    let m = height-1;
    while (m + 1) {
        temp[m] = temp[m].slice();
        let n = width-1;
        while (n + 1) {
            temp[m][n] = eval(m, n, store);
            --n;
        }
        --m;
    }
    return temp;
}

// calculate the new generation
function gen(board) {
    return map2d(board, (i, j, store) => {
        let count = 0;
        let o = neighbors.length-1;
        while (o + 1) {
            let m = neighbors[o][0]+i;
            let n = neighbors[o][1]+j;
            --o;
            if (m < 0 || m >= height || n < 0 || n >= width) {
                continue;
            }
            count += +board[m][n];
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
    return map2d(board, () => (Math.random() > 0.6));
}

// clear the board
function erase(board) {
    return map2d(board, () => false);
}