let size = 42;

window.onload = function() {
    window.container = document.getElementById('container');
    container.addEventListener('mousedown', function(e) {
        let source = e.srcElement;
        let address = source.getAttribute('data-index').split('%');
        let cell = cells[address[0]][address[1]];
        cells[address[0]][address[1]] = !cell;
        source.style.opacity = cell?0:1;
    });
    let temp = '<table cellpadding="0" cellspacing="1">';
    for (let i = 0; i < size; i++) {
        temp += '<tr>';
        for (let j = 0; j < size; j++) {
            temp += `<td data-index=${i+'%'+j}></td>`;
        }
        temp += '</tr>';
    }
    container.innerHTML = temp;
    reset();
};

let cells = [];
function reset() {
    for (let i = 0; i < size; i++) {
        cells[i] = [];
        for (let j = 0; j < size; j++) {
            cells[i][j] = (Math.random()>0.9);
        }
    }
    refresh(false);
}

function refresh(gen) {
    let temp = [];
    for (let i = 0; i < size; i++) {
        temp[i] = [];
        for (let j = 0; j < size; j++) {
            temp[i][j] = iterate(gen, i, j);
            container.children[0].children[0].children[i].children[j].style.opacity = temp[i][j]?1:0;
        }
    }
    cells = temp;
}

function erase() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            cells[i][j] = false;
        }
    }
    refresh(false);
}

function iterate(gen, x, y) {
    let current = cells[x][y];
    if (!gen) {
        return current;
    }
    let counter = 0;
    if (cells[x+1]  && cells[x+1][y+1])   { counter++; }
    if (cells[x+1]  && cells[x+1][y])     { counter++; }
    if (cells[x+1]  && cells[x+1][y-1])   { counter++; }
    if (cells[x]    && cells[x][y+1])     { counter++; }
    if (cells[x]    && cells[x][y-1])     { counter++; }
    if (cells[x-1]  && cells[x-1][y+1])   { counter++; }
    if (cells[x-1]  && cells[x-1][y])     { counter++; }
    if (cells[x-1]  && cells[x-1][y-1])   { counter++; }
    // test survival
    if (current) {
        if (counter < 2) {
            return false;
        } else if (counter > 3) {
            return false;
        } else {
            return true;    
        }
    } else {
        if (counter === 3) {
            return true;
        } else {
            return false
        }
    }
};