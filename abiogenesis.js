// event listener for cell toggles
/*canvas.onmousedown = function(e) {
    let m = (e.pageY - e.target.offsetTop)/celldimensions>>0;
    let n = (e.pageX - e.target.offsetLeft)/celldimensions>>0;
    click_toggle(m, n);
    canvas.onmousemove = function(e) {
        let m = (e.pageY - e.target.offsetTop)/celldimensions>>0;
        let n = (e.pageX - e.target.offsetLeft)/celldimensions>>0;
        hover_toggle(m,n);
    }
    window.onmouseup = function() {
        canvas.onmousemove = undefined;
    }
}*/

create(document.body.children[0].children[0].children[0].children[0]);
create(document.body.children[0].children[0].children[1].children[0]);
create(document.body.children[0].children[0].children[2].children[0]);

function create(origin) {
    // storing the values to loop around a cell
    var neighbors = [
        [-1,-1],[-1, 0],[-1, 1],
        [ 0,-1],/******/[ 0, 1],
        [ 1,-1],[ 1, 0],[ 1, 1]
    ];

    // store the target cell opacity for mouseover
    var changeto = true;

    // store last changed cell
    var lastchanged = null;

    // controls if animation is playing
    var playing = false;

    // creating the board
    var board = [];

    // storing parent element
    var parent = origin.parentNode;

    // storing if the board is editable
    var editable = origin.getAttribute('data-editable') === 'true';

    // creating the canvas
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    // set remaining dimension values and fill board with empty vals
    var w,h,celldimension,width,height;
    resize();

    // randomize board and draw to canvas
    reset();

    // create other wrapper DOM and place in document
    var easel = document.createElement('div');
    easel.style.width = '100%';
    easel.style.cursor = 'default';
    easel.appendChild(canvas);

    var petri = document.createElement('div');
    petri.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.1)';
    petri.style.border = '5px solid #d9534f';
    petri.style.borderRadius = '14px';
    petri.style.padding = '10px';
    petri.style.margin = '20px';
    parent.replaceChild(petri, origin);
    petri.appendChild(easel);

    var buttons = document.createElement('div');
    buttons.setAttribute('role', 'group');
    buttons.className = 'btn-group btn-group-justified';
    buttons.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.1)';
    petri.appendChild(buttons);

    if (editable) {
        var randomize_h = document.createElement('div');
        randomize_h.setAttribute('role', 'group');
        randomize_h.className = 'btn-group';
        buttons.appendChild(randomize_h);
        var randomize_b = document.createElement('button');
        randomize_b.setAttribute('type', 'button');
        randomize_b.setAttribute('title', 'randomize');
        randomize_b.className = 'btn btn-danger';
        randomize_b.innerHTML = '<span class="glyphicon glyphicon-random"></span>';
        randomize_h.appendChild(randomize_b);

        var reset_h = document.createElement('div');
        reset_h.setAttribute('role', 'group');
        reset_h.className = 'btn-group';
        buttons.appendChild(reset_h);
        var reset_b = document.createElement('button');
        reset_b.setAttribute('type', 'button');
        reset_b.setAttribute('title', 'reset');
        reset_b.className = 'btn btn-danger';
        reset_b.innerHTML = '<span class="glyphicon glyphicon-refresh"></span>';
        reset_h.appendChild(reset_b);

        // randomize button listener
        randomize_b.addEventListener('click', reset);

        // reset button listener
        reset_b.addEventListener('click', erase);
    }

    var step_h = document.createElement('div');
    step_h.setAttribute('role', 'group');
    step_h.className = 'btn-group';
    buttons.appendChild(step_h);
    var step_b = document.createElement('button');
    step_b.setAttribute('type', 'button');
    step_b.setAttribute('title', 'step');
    step_b.className = 'btn btn-danger';
    step_b.innerHTML = '<span class="glyphicon glyphicon-step-forward"></span>';
    step_h.appendChild(step_b);

    var playpause_h = document.createElement('div');
    playpause_h.setAttribute('role', 'group');
    playpause_h.className = 'btn-group';
    buttons.appendChild(playpause_h);
    var playpause_b = document.createElement('button');
    playpause_b.setAttribute('type', 'button');
    playpause_b.setAttribute('title', 'play/pause');
    playpause_b.className = 'btn btn-danger';
    playpause_b.innerHTML = `<span class="glyphicon glyphicon-play"></span>
                            <span class="glyphicon glyphicon-pause"></span>`;
    playpause_h.appendChild(playpause_b);
    
    // adjust board for new screen dimensions
    window.addEventListener('resize', resize);

    // step button listener
    step_b.addEventListener('click', function() {
        board = gen(board);
    });

    // playpause button listener
    playpause_b.addEventListener('click', function() {
        playing = !playing;
        genloop();
    });

    // recalculating variables
    function resize() {
        // pause loop
        /*playing = false;*/

        // canvas' pixel dimensions
        w = Math.max(parent.clientWidth-100, 300);
        h = w*2/3;
        canvas.width = w;
        canvas.height = h;

        // cell height/width
        celldimensions = Math.max(6, h/70 >> 0);

        // number of vertical and horizontal cells
        width = w/celldimensions >> 0;
        height = h/celldimensions >> 0;

        // pad or contract board
        var temp = [];
        var m = height-1;
        while (m > -1) {
            temp[m] = [];
            var n = width-1;
            while (n > -1) {
                temp[m][n] = (board[m] && board[m][n]) || false;
                --n;
            }
            --m;
        }
        board = temp;
        draw(board);
        //console.log(board.toString());
    }

    // loops through the generations until "playing" is false
    function genloop() {
        if (playing) {
            board = gen(board);
            requestAnimationFrame(genloop);
        }
    }

    // calculate and display the new generation
    function gen(board) {
        context.clearRect(0, 0, w, h);
        var temp = [];
        var m = height-1;
        while (m > -1) {
            temp[m] = [];
            var verticalpos = m*celldimensions;
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
                var cellval;
                if (board[m] && board[m][n]) {
                    if (count === 2) { cellval = true; }
                    else if (count === 3) {cellval = true;}
                    else {cellval = false;}
                } else {
                    if (count === 3) {cellval = true;}
                    else {cellval = false}
                }
                if (cellval) {
                    context.fillRect(n*celldimensions, verticalpos, celldimensions, celldimensions);
                }
                temp[m][n] = cellval;
                --n;
            }
            --m;
        }
        return temp;
    }

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

    // fill 2d array with random booleans
    function reset() {
        board = board.map((row) => row.map(() => Math.random() < 0.44));
        draw(board);
    }

    // fill 2d array with false values
    function erase() {
        board = board.map((row) => row.map(() => false));
        draw(board);
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
}
