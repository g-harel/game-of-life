
// storing the values to loop around a cell
let neighbors = [
    [-1,-1],[-1, 0],[-1, 1],
    [ 0,-1],/*[00]*/[ 0, 1],
    [ 1,-1],[ 1, 0],[ 1, 1]
]

// board size
let width = 6;
let height = 6;

// initialize blank board
let board = (new Array(height)).fill((new Array(width).fill(true)));

// store the target cell opacity for mouseover
let changeto = 1;

// create canvas and fetch imageData 
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

// calculate canvas
function draw(board) {
    let data = imageData.data;
    let length = data.length;
    let w = canvas.width;
    let h = canvas.height;
    for (let i = 0; i < length; ++i) {
        let j = i/4 >> 0;
        let color = board[j/w/h*height>>0][j%w/w*width>>0]?0:255;
        data[i] = color; ++i;
        data[i] = color; ++i;
        data[i] = color; ++i;
        data[i] = 255;
    }
    context.putImageData(imageData, 0, 0);
}

board = reset(board);
draw(board);

window.onclick =  function() {
    console.log('gen');
    let newboard = gen(board);
    board = newboard;
    draw(newboard);
}

/*let count = 500;
function genloop() {
    draw(board);
    board = reset(board);
    if (count !== 0) {
        --count;
        requestAnimationFrame(genloop);
    }
}
genloop();*/

// loop over all cells
function map2d(store, eval) {
    let temp = store.slice();
    for (let i = 0; i < height; ++i) {
        temp[i] = temp[i].slice();
        for (let j = 0; j < width; ++j) {
            temp[i][j] = eval(i, j, store);
        }
    }
    return temp;
}

// calculate the new generation
function gen(board) {
    return map2d(board, (i, j, store) => {
        let count = 0;
        for (let k = 0; k < neighbors.length; ++k) {
            let m = neighbors[k][0]+i;
            let n = neighbors[k][1]+j;
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