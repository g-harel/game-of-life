(function() {
    // storing the values to loop around a cell
    var neighbors = [
        [-1,-1],[-1, 0],[-1, 1],
        [ 0,-1],/******/[ 0, 1],
        [ 1,-1],[ 1, 0],[ 1, 1]
    ];

    // find all boards and fill em up
    var boards = document.querySelectorAll('board');
    for (var i = 0; i <	boards.length; i++) {
        create(boards[i]);
    }

    // creates a game-of-life board in place of element passed as argument
    function create(origin) {
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

        // create wrapper DOM and place in document
        parent.innerHTML = `
        <style>
            .gol-wrapper {
                box-shadow: 3px 3px 0 rgba(0,0,0,0.1);
                border: 5px solid #d9534f;
                box-sizing: border-box;
                border-radius: 14px;
                min-width: 300px;
                width: 100%;
            }

            .gol-canvas-wrapper {
                padding: 10px 10px 0;
            }

            .gol-button-wrapper {
                padding: 5px 0 12px 10px;
            }

            .gol-button-wrapper > table {
                table-layout: fixed;
            }

            .gol-button-wrapper td {
                padding: 0 10px 0 0;
            }

            .gol-button {
                box-shadow: 1px 3px 0 #d9534f, 3px 5px 0 rgba(0,0,0,0.1);
                border: 3px solid #d9534f;
                border-radius: 5px;
                text-align: center;
                user-select: none;
                color: #d9534f;
                cursor: pointer;
                padding: 10px;
            }

            .gol-button:active {
                transform: translateY(3px) translateX(1px);
                box-shadow: none;
            }
        </style>
        <div class="gol-wrapper">
            <div class="gol-canvas-wrapper">
                <canvas></canvas>
            </div>
            <div class="gol-button-wrapper">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="
                            padding: 0 10px 0 0;">
                            <div class="gol-button" title="random">
                                <i class="fa fa-random fa-lg"></i>
                            </div>
                        </td>
                        <td style="
                            padding: 0 10px 0 0;">
                            <div class="gol-button" title="erase">
                                <i class="fa fa-refresh fa-lg"></i>
                            </div>
                        </td>
                        <td style="
                            padding: 0 10px 0 0;">
                            <div class="gol-button" title="step">
                                <i class="fa fa-step-forward fa-lg"></i>
                            </div>
                        </td>
                        <td style="
                            padding: 0 10px 0 0;">
                            <div class="gol-button" title="play/pause">
                                <i class="fa fa-play"></i>
                                <i class="fa fa-pause"></i>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>`;

        // creating the canvas
        var canvas = parent.children[1].children[0].children[0];
        var context = canvas.getContext('2d');

        // set remaining dimension values and fill board with empty vals
        var w,h,celldimension,width,height;
        resize();

        // randomize board and draw to canvas
        reset();
        
        // adjust board for new screen dimensions
        window.addEventListener('resize', resize);

        // randomize button listener
        parent
            .children[1].children[1].children[0]
            .children[0].children[0].children[0]
            .addEventListener('click', reset);

        // reset button listener
        parent
            .children[1].children[1].children[0]
            .children[0].children[0].children[1]
            .addEventListener('click', erase);

        // step button listener
        parent
            .children[1].children[1].children[0]
            .children[0].children[0].children[2]
            .addEventListener('click', function() {
                board = gen(board);
            });

        // playpause button listener
        parent
            .children[1].children[1].children[0]
            .children[0].children[0].children[3]
            .addEventListener('click', function() {
                playing = !playing;
                genloop();
            });

        // event listener for cell toggles
        canvas.onmousedown = function(e) {
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
            canvas.onmouseout = function() {
                canvas.onmousemove = undefined;
            }
        }

        // recalculating variables
        function resize() {
            // canvas' pixel dimensions
            w = canvas.parentNode.clientWidth - 20;
            h = w*2/3;
            canvas.width = w;
            canvas.height = h;

            // cell height/width
            celldimensions = 10 || Math.max(6, h/70 >> 0);

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
            /* draw() function is intentionally not used for slightly better performance */
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
            if (m >= height || n >= width) {
                return;
            }
            var newval = !board[m][n]
            board[m][n] = newval;
            changecell(m, n, newval);
            changeto = newval;
        }

        // toggles cell to same value as first one
        function hover_toggle(m, n) {
            if (m >= height || n >= width) {
                return;
            }
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
}());