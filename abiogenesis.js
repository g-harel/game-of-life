let kill = true;

let container = document.body.children[0];

let cells = [];

function update() {
    let generation = cells.map(function(val) {
        return val.map(function(val) {
            return val.iterate();
        });
    });
    let temp = '';
    cells.forEach(function(val, i) {
        temp+='<div class="row">';
        val.forEach(function(val, j) {
            if (!kill) {
                val.state=generation[i][j];
            }
            temp+=val.render();
        });
        temp+='</div>';
    });
    container.innerHTML = temp;
    if (!kill) {
        window.requestAnimationFrame(update);
    }
}

function play() {
    kill = false;
    window.requestAnimationFrame(update);
}

function pause() {
    kill = true;
}

function init() {
    for (let i = 0; i < 100; i++) {
        cells[i] = [];
        for (let j = 0; j < 100; j++) {
            cells[i][j] = new cell(Math.random()>0.998, [i, j]);
        }
    }
    kill = true;
    update();
}

function cell(state, coord) {
    this.state = !!state;
    this.coord = coord || [0,0];
}

cell.prototype.render = function() {
    return `<div class="cell" style="background-color:${this.state?'black':'white'}"></div>`;
};

cell.prototype.iterate = function() {
    let counter = 0,
        x = this.coord[0];
        y = this.coord[1];
    if (cells[x+1]  && cells[x+1][y+1]  && cells[x+1][y+1].state)   { counter++; }
    if (cells[x+1]  && cells[x+1][y]    && cells[x+1][y].state)     { counter++; }
    if (cells[x+1]  && cells[x+1][y-1]  && cells[x+1][y-1].state)   { counter++; }
    if (cells[x]    && cells[x][y+1]    && cells[x][y+1].state)     { counter++; }
    if (cells[x]    && cells[x][y-1]    && cells[x][y-1].state)     { counter++; }
    if (cells[x-1]  && cells[x-1][y+1]  && cells[x-1][y+1].state)   { counter++; }
    if (cells[x-1]  && cells[x-1][y]    && cells[x-1][y].state)     { counter++; }
    if (cells[x-1]  && cells[x-1][y-1]  && cells[x-1][y-1].state)   { counter++; }
    // die
    if (counter < 2 || counter > 3) { return false; }
    // survive
    if (counter === 2 || (counter === 3 && this.state)) { return true; }
    // birth
    if (counter === 3 && !this.state) { return true; }
};

init();
update();