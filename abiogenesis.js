
// storing the values to loop around a cell
var neighbors = [
    [-1,-1],[-1, 0],[-1, 1],
    [ 0,-1],/*[00]*/[ 0, 1],
    [ 1,-1],[ 1, 0],[ 1, 1]
]

// create canvas
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

// storing canvas dimensions
var w = canvas.width;
var h = canvas.height;

// saving cell dimensions
var celldimensions = 10;

// calculating board size
var width = w/celldimensions>>0;
var height = h/celldimensions>>0;

// initialize board
var board = [];

// store the target cell opacity for mouseover
var changeto = true;

// store last changed cell
var lastchanged = null;

// controls if animation is playing
var playing = false;

// toggles cell to the opposite status
function click_toggle(m, n) {
    var newval = !board[m][n]
    board[m][n] = newval;
    changecell(m, n, newval);
    changeto = newval;
}

// toggles cell to same value as first one
function hover_toggle(m, n) {
    if (lastchanged && lastchanged[0] === m && lastchanged[1] === n) {
        return;
    }
    changecell(m,n, changeto);
}

// changes cell to specified value
function changecell(m, n, val) {
    if (val) {
        context.fillRect(n*celldimensions, m*celldimensions, celldimensions, celldimensions);
    } else {
        context.clearRect(n*celldimensions, m*celldimensions, celldimensions, celldimensions);
    }
    board[m][n] = !!val;
    lastchanged = [m,n];
}

// loops through the generations until "playing" is false
function genloop() {
    if (playing) {
        board = gen(board);
        draw(board);
        requestAnimationFrame(genloop);
    }
}

// draws cells to canvas with fillRect
function draw(board) {
    context.clearRect(0, 0, w, h);
    var m = height-1;
    while (m + 1) {
        var n = width-1;
        var verticalpos = m*celldimensions;
        while (n + 1) {
            if (board[m] && board[m][n]) {
                context.fillRect(n*celldimensions, verticalpos, celldimensions, celldimensions);
            }
            --n;
        }
        --m;
    }
}

// calculate the new generation
function gen(board) {
    var temp = [];
    var m = height-1;
    while (m > -1) {
        temp[m] = [];
        var n = width-1;
        while (n > -1) {
            var count = 0;
            var o = neighbors.length-1;
            while (o > -1) {
                var _m = (neighbors[o][0]+m+height)%height;
                var _n = (neighbors[o][1]+n+width)%width;
                --o;
                if (board[_m] && board[_m][_n]) {
                    ++count;
                }
            }
            if (board[m] && board[m][n]) {
                if (count === 2) {
                    temp[m][n] = true;
                } else if (count === 3) {
                    temp[m][n] = true;
                } else {
                    temp[m][n] = false;
                }
            } else {
                if (count === 3) {
                    temp[m][n] = true;
                } else {
                    temp[m][n] = false
                }
            }
            --n;
        }
        --m;
    }
    return temp;
}

// map over all cells of the internal board (not fast enough for gen function)
function map2d(store, cb) {
    var temp = [];
    var m = height-1;
    while (m > -1) {
        temp[m] = [];
        var n = width-1;
        while (n > -1) {
            temp[m][n] = cb(m, n, store);
            --n;
        }
        --m;
    }
    return temp;
}

// randomize board
function reset(board) {
    return map2d(board, function() {
        return Math.random() < 0.44;
    });
}

// clear the board
function erase(board) {
    return map2d(board, function() {
        return false;
    });
}

// recalculating variables and redraw
function resize() {
    var parent = canvas.parentNode;
    w = parent.clientWidth;
    h = w*2/3;
    canvas.width = w;
    canvas.height = h;
    celldimensions = Math.max(6, h/70 >> 0);
    width = w/celldimensions>>0;
    height = h/celldimensions>>0;
    draw(board);
}

// draw initial board
window.onload = function() {
    board = reset(board);
    resize();
}

// adjust board for new screen dimensions
window.onresize = resize;