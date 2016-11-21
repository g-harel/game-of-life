
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
}