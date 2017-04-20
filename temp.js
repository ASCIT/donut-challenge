var keysPressed = {}, distPerIteration = 3, maxValue = $(window).width();
var myVar;

$(window).keydown(function(event) { keysPressed[event.which] = true });
$(window).keyup(function(event) { keysPressed[event.which] = false});


function calcNewValue(oldValue, keyCode1, keyCode2) {
    var newValue = parseInt(oldValue, 10) 
                   - (keysPressed[keyCode1] ? distPerIteration : 0)
                   + (keysPressed[keyCode2] ? distPerIteration : 0);
    return newValue < 0 ? 0 : newValue > maxValue ? maxValue : newValue
}

function beginGame(){
    var y = $('#test');
    y.css("visibility", "visible");
    myVar = setInterval(function(){
        y.css({
            left: function(index, oldValue) { return calcNewValue(oldValue, 37, 39); },
            top: function(index, oldValue) { return calcNewValue(oldValue, 38, 40); } 
            
        });
    }, 20);
    var audio = new Audio('music/adventure_awaits.mp3');
    audio.play();
    document.getElementById("start_box").style.display = 'none';
}


function getRotationDegrees(obj){
    var matrix = obj.css("-webkit-transform") ||
    obj.css("-moz-transform") ||
    obj.css("-ms-transform") ||
    obj.css("-o-transform") ||
    obj.css("transform");
    if(matrix !== 'none'){
        var values = matrix.split('(')[1].split(')')[0].split(',');
        var a = values[0];
        var b = values[1];
        var angle = Math.round(Math.atan2(b,a) * (180/Math.PI));
    }else {var angle = 0;}

    if(angle < 0) angle += 360;
    return angle;
}

