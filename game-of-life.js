( function() {
    // start executing when all DOM has been loaded
    document.addEventListener( "DOMContentLoaded", function( event ) {
        // find all boards
        var boards = document.querySelectorAll( 'board' );

        // add style to body if boards are found
        if ( boards.length ) {
            // adding font-awesome to the head
            var fa = document.createElement( 'link' );
            fa.rel = 'stylesheet';
            fa.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
            document.head.appendChild( fa );

            // adding custom styles for boards
            var style = document.createElement( 'style' );
            style.innerHTML = `
            .gol-wrapper {
                user-select: none;
                display: table;
                width: 100%;
            }

            .gol-border-wrapper {
                background-color: rgba(255,255,255,0.8);
                box-shadow: 1px 1px 0 rgba(0,0,0,0.1);
                border: 1px solid #ccc;
                margin: 0 0 16px;
                float: left;
            }

            .gol-canvas-wrapper {
                padding: 10px 10px 0;
            }

            .gol-button-wrapper {
                padding: 5px 0 10px 10px;
            }

            .gol-button-wrapper > table {
                table-layout: fixed;
            }

            .gol-button-wrapper td {
                padding: 0 10px 0 0;
            }

            .gol-button {
                box-shadow: 1px 1px 0 rgba( 0,0,0,0.1 );
                font-size: 10px;
                border: 1px solid #ccc;
                border-radius: 2px;
                text-align: center;
                user-select: none;
                cursor: pointer;
                padding: 10px;
                color: #aaa;
            }

            .gol-button:active {
                transform: translateY( 1px ) translateX( 1px );
                box-shadow: none;
            }`;
            document.head.appendChild( style );
        }

        // replacing the board elements with a board
        for ( var i = 0; i <	boards.length; i++ ) {
            create( boards[i] );
        }
    } );

    // append the game-of-life wrapper to the parent element
    function create_wrapper( parent, board, static ) {
        var wrapper = document.createElement( 'div' );
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
        parent.replaceChild( wrapper, board );
        return wrapper;
    }

    // creates a game-of-life board in place of element passed as argument
    function create( origin ) {
        // store the target cell opacity for mouseover
        var changeto = true;

        // store last changed cell
        var lastchanged = null;

        // controls if animation is playing
        var playing = false;

        // storing parent element
        var parent = origin.parentNode;

        // storing if the board is static
        var static = origin.getAttribute( 'gol-static' ) === 'true';

        // storing custom pixel ratio
        var ratio = Number( origin.getAttribute( 'gol-ratio' ) ) || 0.6;

        // storing custom absolute board width
        var width = Number( origin.getAttribute( 'gol-width' ) ) >> 0;

        // storing custom absolute board width
        var construct = origin.getAttribute( 'gol-construct' ) || '';

        // making sure width >= 10 and calculating height
        if ( width !== undefined ) {
            if ( width < 10 ) {
                width = 10;
            }
            if ( width > 360 ) {
                width = 360;
            }
            var height = width * ratio >> 0;
        }

        // creating board
        var board = new Array( width * height ).fill( false );

        // create wrapper DOM and place in document
        var wrapper = create_wrapper( parent, origin, static );

        // creating the canvas
        var canvas = wrapper.children[0].children[0].children[0];
        var context = canvas.getContext( '2d' );

        // set remaining dimension values
        var celldimensions,w,h;
        resize();

        // set initial board state and draw to canvas
        if ( construct && constructs[construct] ) {
            buildme( construct );
        } else {
            reset();
        }
        
        // adjust board for new screen dimensions
        window.addEventListener( 'resize', function() {
            requestAnimationFrame( resize );
        } );

        // recalculating variables
        function resize() {
            // storing target width
            var target_width = canvas.parentNode.parentNode.parentNode.parentNode.clientWidth - 60;

            // making sure target_width is big enough for buttons to display properly
            if ( static ) {
                if ( target_width < 150 ) {
                    target_width = 150;
                }
            } else {
                if ( target_width < 410 ) {
                    target_width = 410;
                }
            }

            // storing past cell dimensions
            var prev = celldimensions;

            // recalculating pixel dimensions
            celldimensions = target_width/width >> 0;
            
            // finding canvas' dimensions
            w = width*celldimensions;
            h = height*celldimensions;

            // redraw if necessary
            if ( prev !== celldimensions ) {
                //resizing the canvas
                canvas.width = w;
                canvas.height = h;

                // making the button collapse to canvas' width
                wrapper.children[0].children[1].style.width = w + 20 + 'px';

                // draw to screen
                draw( board );
            }
        }

        // step button listener
        wrapper.children[0].children[1].children[0].children[0].children[0].children[0]
            .addEventListener( 'click', function() {
               playing = false;
               gen();
            } );

        // playpause button listener
        wrapper.children[0].children[1].children[0].children[0].children[0].children[1]
            .addEventListener( 'click', function() {
                playing = !playing;
                gen();
            } );
        
        // conditionally add listeners to randomize and reset buttons
        if ( !static ) {
            // randomize button listener
            wrapper.children[0].children[1].children[0].children[0].children[0].children[2]
                .addEventListener( 'click', reset );

            // reset button listener
            wrapper.children[0].children[1].children[0].children[0].children[0].children[3]
                .addEventListener( 'click', erase );
        }

        // allow drawing when editable
        if ( !static ) {
            // event listener for cell toggles
            canvas.onmousedown = function( e ) {
                var rect = canvas.getBoundingClientRect();
                let m = ( e.clientY - rect.top )/celldimensions >> 0;
                let n = ( e.clientX - rect.left )/celldimensions >> 0;
                click_toggle( m, n );
                canvas.onmousemove = function( e ) {
                    let m = ( e.clientY - rect.top )/celldimensions >> 0;
                    let n = ( e.clientX - rect.left )/celldimensions >> 0;
                    hover_toggle( m,n );
                }
                window.onmouseup = function() {
                    canvas.onmousemove = undefined;
                }
                canvas.onmouseout = function() {
                    canvas.onmousemove = undefined;
                }
            }
        }

        // calculate and display the new generation
            /* draw() function is intentionally not used for slightly better performance */
        function gen() {
            // clearing the board ( slightly faster than clearRect )
            canvas.width = canvas.width;
            var temp = [];
            var len = width * height;
            var m = len;
            var count, x_inc, x_dec, y_inc, y_dec, m_inc, m_dec;
            while ( m ) {  --m;
                count = 0;
                // calculating increments / decrements
                x_inc = ( m + 1 )%width - m%width;
                x_dec = ( m - 1 + width)%width - m%width;
                y_inc = ( m + width )%len - m%len;
                y_dec = ( m - width + len )%len - m%len;
                // precalculating horizontal incremented / decremented value
                m_inc = m + x_inc;
                m_dec = m + x_dec;
                // horizontal neighbors
                if ( board[m_inc] === true ) { ++count; }
                if ( board[m_dec] === true ) { ++count; }
                // neighbors below
                if ( board[m + y_inc] === true ) { ++count; }
                if ( board[m_inc + y_inc] === true ) { ++count; }
                if ( board[m_dec + y_inc] === true ) { ++count; }
                // neighbors above
                if ( board[m + y_dec] === true ) { ++count; }
                if ( board[m_inc + y_dec] === true ) { ++count; }
                if ( board[m_dec + y_dec] === true ) { ++count; }
                // deciding on next gen and drawing
                if ( count === 3 || ( count === 2 && board[m] === true ) ) {
                    temp[m] = true;
                    context.fillRect( (m%width)*celldimensions, (m/width>>0)*celldimensions, celldimensions, celldimensions );
                } else {
                    temp[m] = false;
                }
            }
            board = temp.slice();
            if ( playing ) {
                requestAnimationFrame( gen );
            }
        }

        // toggles cell to the opposite status
        function click_toggle( m, n ) {
            var index = m * width + n;
            var newval = !board[index]
            board[index] = newval;
            changecell( index, m, n, newval );
            changeto = newval;
        }

        // toggles cell to same value as first one
        function hover_toggle( m, n ) {
            var index = m * width + n;
            if ( lastchanged === index ) {
                return;
            }
            changecell( index, m, n, changeto );
        }

        // changes cell to specified value
        function changecell( index, m, n, val ) {
            if ( val ) {
                context.fillRect( n*celldimensions, m*celldimensions, celldimensions, celldimensions );
            } else {
                context.clearRect( n*celldimensions, m*celldimensions, celldimensions, celldimensions );
            }
            board[index] = !!val;
            lastchanged = index;
        }

        // fill 2d array with random booleans
        function reset() {
            board = board.map( () => Math.random() < 0.44 );
            draw( board );
        }

        // fill 2d array with false values
        function erase() {
            playing = false;
            board = board.map( () => false );
            draw( board );
        }

        // draws cells to canvas with fillRect
        function draw( board ) {
            // clearing the board ( slightly faster than clearRect )
            canvas.width = canvas.width;
            var m = height * width;
            while ( m ) { --m;
                if ( board[m] ) {
                    context.fillRect( (m%width)*celldimensions, (m/width>>0)*celldimensions, celldimensions, celldimensions );
                }
            }
        }

        // draws specified construct to the board
        function buildme( construct_name ) {
            var c = constructs[construct_name];
            var c_width = c[0].length;
            var c_height = c.length;
            if ( ( c_width + 2 >= width ) || ( c_height + 2 >= height ) ) {
                console.log(`Could not display ${construct_name} because the board is too small`);
                reset();
                return;
            }
            var start_index = ( ( width - c_width + 1 )/2 >> 0 ) + ( ( height - c_height + 1 )/2 >> 0 ) * width;
            for (let i = 0; i < c.length; ++i) {
                for (let j = 0; j < c[i].length; ++j) {
                    board[start_index + i*width + j] = !! c[i][j];
                }
            }
            draw( board );
        }
    }

    // game of life structures of interest, can be added into any canvas (of big enough size)
    // credits to https://github.com/dcodeIO/dcodeio.github.io/blob/master/js/GameOfLife/structures.js for the structures
    var constructs = {
        // spaceships
        "glider": [
            [0,0,1],
            [1,0,1],
            [0,1,1]
        ],

        "ship": [
            [1,0,0,1,0],
            [0,0,0,0,1],
            [1,0,0,0,1],
            [0,1,1,1,1]
        ],

        "dart": [
            [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
            [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,1,1,0,0,0,1,1,0,0,0,0],
            [0,0,1,0,0,0,1,0,1,0,0,0,1,0,0],
            [0,1,1,0,0,0,1,0,1,0,0,0,1,1,0],
            [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
            [0,1,0,1,1,0,1,0,1,0,1,1,0,1,0]
        ],

        "schick": [
            [0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,0],
            [0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1,1,1],
            [0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,0],
            [1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],

        "barge": [
            [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0],
            [0,1,1,0,1,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,1,0,1,1,0],
            [0,1,1,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,1,1,0],
            [1,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1,1,1,1,1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,0,0,0,0,0,0,1,0,0,1],
            [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,0,1,0,0,0,1,0,1,1,0,0,0,1,1,0,1,0,0,0,1,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,1,0,1,0,1,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,0,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],

        // oscillators
        "pulsar": [
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,1,1,1,0,0]
        ],

        "roteightor": [
            [0,1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,0,0,0,0,0,0,0,0,1,1],
            [0,0,0,0,1,0,0,0,0,0,0,0,1,0],
            [0,0,0,1,0,0,0,0,0,0,1,0,1,0],
            [0,0,0,1,0,0,0,1,0,0,1,1,0,0],
            [0,0,0,0,0,0,0,0,1,0,0,0,0,0],
            [0,0,0,0,0,1,0,0,1,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,0,0,0,0,0,0,0,0],
            [0,1,0,1,0,0,0,0,0,1,1,0,0,0],
            [0,1,0,0,0,0,0,0,0,1,0,0,0,0],
            [1,1,0,0,0,0,0,0,0,0,1,1,1,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,0]
        ],

        "dancers": [
            [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0],
            [0,0,1,0,1,1,0,0,0,1,1,1,0,0,0,0,0],
            [0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,0,0,1,1,0,0,0,0,0,0,0,0,1,0,0],
            [0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0],
            [0,0,1,0,0,0,0,0,0,0,0,1,1,0,0,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0],
            [0,0,0,0,0,1,1,1,0,0,0,1,1,0,1,0,0],
            [0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]
        ]
    }
}() );