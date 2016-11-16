// board size
let size = 42;

// store the cell opacity target for mouseover
let changeto = 1;

// create cells in the DOM and setup event listener
window.onload = function() {
    window.container = document.getElementById('container').children[0];
    // click event
    container.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'TD' && e.buttons === 1) {
            e.preventDefault();
            let source = e.srcElement;
            changeto = (source.style.opacity < 1)?1:0.01;
            source.style.opacity = changeto;
        }
    });
    // click + drag event
    container.addEventListener('mouseover', function(e) {
        if (e.target.tagName === 'TD' && e.buttons === 1) {
            e.preventDefault();
            e.srcElement.style.opacity = changeto;
        }
    });
    let temp = '';
    for (let i = 0; i < size; i++) {
        temp += '<tr>';
        for (let j = 0; j < size; j++) {
            temp += '<td></td>';
        }
        temp += '</tr>';
    }
    container.innerHTML = temp;
    reset();
};

// looping the generation animation
function play() {

}

// stopping the generation loop
function pause() {

}

// loop over all cells of the DOM
function iterate(eval) {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let cell = container.children[0].children[i].children[j];
            let updated_val = eval(j, j)?1:0.01;
            if (cell.style.opacity !== updated_val) {
                cell.style.opacity = updated_val;
            }
        }
    }
}

// evaluate the new generation
function gen() {
    iterate((i, j) => {
        let parent = container.children[0];
        let count = 0;
        let right = parent.children[i+1];
        if (right) {            
            if (right.children[j+1] && right.children[j+1].style.opacity == 1) { count++; }
            if (right.children[ j ] && right.children[ j ].style.opacity == 1) { count++; }
            if (right.children[j-1] && right.children[j-1].style.opacity == 1) { count++; }
            console.log(right.children[j+1] && right.children[j+1].style.opacity === 1, right.children[j] && right.children[j].style.opacity === 1,right.children[j-1] && right.children[j-1].style.opacity === 1)
        }
        let left = parent.children[i-1];
        if (left) {            
            if (left.children[j+1] && left.children[j+1].style.opacity == 1) { count++; }
            if (left.children[ j ] && left.children[ j ].style.opacity == 1) { count++; }
            if (left.children[j-1] && left.children[j-1].style.opacity == 1) { count++; }
        }
        let middle = parent.children[i];
        if (middle) {            
            if (middle.children[j+1] && middle.children[j+1].style.opacity == 1) { count++; }
            if (middle.children[j-1] && middle.children[j-1].style.opacity == 1) { count++; }
        }
        if (count > 0) {
            console.log('> > ' + count)
        }
        //console.log(count)
        if (parent.children[i].children[j].style.opacity == 1) {
            if (count < 2) {
                return false;
            } else if (count > 3) {
                return false;
            } else {
                return true;    
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
function reset() {
    iterate(() => (Math.random() > 0.9));
}

// clear the board
function erase() {
    iterate(() => false);
}