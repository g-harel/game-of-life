(function() {
    // storing the values to loop around a cell
    var neighbors = [
        [-1,-1],[-1, 0],[-1, 1],
        [ 0,-1],/******/[ 0, 1],
        [ 1,-1],[ 1, 0],[ 1, 1]
    ];

    // start executing when all DOM has been loaded
    document.addEventListener("DOMContentLoaded", function(event) {
        // find all boards
        var boards = document.querySelectorAll('board');

        // add style to body if boards are found
        if (boards.length) {
            // adding font-awesome to the head
            var fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
            document.head.appendChild(fa);

            // adding custom styles for boards
            var style = document.createElement('style');
            style.innerHTML = `
            .gol-wrapper {
                display: table;
                width: 100%;
            }

            .gol-border-wrapper {
                box-shadow: 3px 3px 0 rgba(0,0,0,0.1);
                border: 5px solid #2e6da4;
                box-sizing: border-box;
                border-radius: 10px;
                margin: 0 0 16px;
                float: left;
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
                box-shadow: 1px 3px 0 #2e6da4, 3px 5px 0 rgba(0,0,0,0.1);
                border: 3px solid #2e6da4;
                border-radius: 5px;
                text-align: center;
                user-select: none;
                color: #2e6da4;
                cursor: pointer;
                padding: 10px;
            }

            .gol-button:active {
                transform: translateY(3px) translateX(1px);
                box-shadow: none;
            }`;
            document.body.appendChild(style);
        }

        // replacing the board elements with a board
        for (var i = 0; i <	boards.length; i++) {
            create(boards[i]);
        }
    });

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

        // removing the placeholder board element from the parent
        parent.removeChild(origin);

        // storing if the board is static
        var static = origin.getAttribute('gol-static') === 'true';

        // storing custom pixel ratio
        var ratio = Number(origin.getAttribute('gol-ratio')) || 0.6;

        // storing custom pixel dimensions
        var celldimensions = Number(origin.getAttribute('gol-pixel')) >> 0 || 8;

        // storing custom absolute board width
        var width = Number(origin.getAttribute('gol-width')) >> 0;

        // making sure width >= 10 and calculating height
        if (width) {
            if (width < 10) {
                width = 10;
            }
            var abs_dimensions = true;
            var height = width * ratio >> 0;
        }

        // create wrapper DOM and place in document
        var wrapper = create_wrapper(parent, static);

        // creating the canvas
        var canvas = wrapper.children[0].children[0].children[0];
        var context = canvas.getContext('2d');

        // set remaining dimension values and fill board with empty vals
        var w,h,width,height;
        resize();

        // ugly workaround to fix an issue with canvas size on initial page load
        setTimeout(resize, 0);

        // randomize board and draw to canvas
        reset();
        
        // adjust board for new screen dimensions
        window.addEventListener('resize', function() {
            requestAnimationFrame(resize);
        });

        // step button listener
        wrapper.children[0].children[1].children[0].children[0].children[0].children[0]
            .addEventListener('click', function() {
                board = gen(board);
            });

        // playpause button listener
        wrapper.children[0].children[1].children[0].children[0].children[0].children[1]
            .addEventListener('click', function() {
                playing = !playing;
                genloop();
            });
        
        // conditionally add listeners to randomize and reset buttons
        if (!static) {
            // randomize button listener
            wrapper.children[0].children[1].children[0].children[0].children[0].children[2]
                .addEventListener('click', reset);

            // reset button listener
            wrapper.children[0].children[1].children[0].children[0].children[0].children[3]
                .addEventListener('click', erase);
        }

        // allow drawing when editable
        if (!static) {
            // event listener for cell toggles
            canvas.onmousedown = function(e) {
                var rect = canvas.getBoundingClientRect();
                let m = (e.clientY - rect.top)/celldimensions >> 0;
                let n = (e.clientX - rect.left)/celldimensions >> 0;
                click_toggle(m, n);
                canvas.onmousemove = function(e) {
                    let m = (e.clientY - rect.top)/celldimensions >> 0;
                    let n = (e.clientX - rect.left)/celldimensions >> 0;
                    hover_toggle(m,n);
                }
                window.onmouseup = function() {
                    canvas.onmousemove = undefined;
                }
                canvas.onmouseout = function() {
                    canvas.onmousemove = undefined;
                }
            }
        }

        // recalculating variables
        function resize() {

            // storing target width
            var target_width = canvas.parentNode.parentNode.parentNode.parentNode.clientWidth - 60;

            // making sure target_width >= 410
            if (target_width < 410) {
                target_width = 410;
            }

            // different calculations if absolute dimensions are specified
            if (abs_dimensions) {
                // recalculating pixel dimensions
                celldimensions = target_width/width >> 0;

                // finding canvas' dimensions
                w = width*celldimensions;
                h = height*celldimensions;
            } else {
                // canvas' pixel dimensions
                w = target_width;
                h = w*ratio;

                // number of vertical and horizontal cells
                width = w/celldimensions >> 0;
                height = h/celldimensions >> 0;
            }

            //resizing the canvas
            canvas.width = w;
            canvas.height = h;

            // making the button collapse to canvas' width
            wrapper.children[0].children[1].style.width = w + 20 + 'px';

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

            // draw to screen
            draw(board);
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
            // clearing the board (slightly faster than clearRect)
            canvas.width = canvas.width;
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
            playing = false;
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

    // append the game-of-life wrapper to the parent element
    function create_wrapper(parent, static) {
        var wrapper = document.createElement('div');
        wrapper.className = 'gol-wrapper';
        wrapper.innerHTML = `
        <div class="gol-border-wrapper">
            <div class="gol-canvas-wrapper">
                <canvas></canvas>
            </div>
            <div class="gol-button-wrapper">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td colspan="3">
                            <div class="gol-button" title="step">
                                <i class="fa fa-step-forward fa-lg"></i>
                            </div>
                        </td>
                        <td colspan="3">
                            <div class="gol-button" title="play/pause">
                                <i class="fa fa-play"></i>
                                <i class="fa fa-pause"></i>
                            </div>
                        </td>
                        ${!static?
                            `<td>
                                <div class="gol-button" title="random">
                                    <i class="fa fa-random fa-lg"></i>
                                </div>
                            </td>
                            <td>
                                <div class="gol-button" title="erase">
                                    <i class="fa fa-refresh fa-lg"></i>
                                </div>
                            </td>`
                        :''}
                    </tr>
                </table>
            </div>
        </div>`;
        parent.appendChild(wrapper);
        return wrapper;
    }
}());