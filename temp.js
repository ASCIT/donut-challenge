var keysPressed = {}, distPerIteration = 3, maxValueLeft = $(window).width();
var myVar, maxValueTop = $(window).height();

$(window).keydown(function(event) { keysPressed[event.which] = true });
$(window).keyup(function(event) { keysPressed[event.which] = false});


function calcNewValue(oldValue, keyCode1, keyCode2, maxValue) {
    var newValue = parseInt(oldValue, 10) 
                   - (keysPressed[keyCode1] ? distPerIteration : 0)
                   + (keysPressed[keyCode2] ? distPerIteration : 0);
    return newValue < 0 ? 0 : newValue > maxValue ? maxValue : newValue
}

function minion(){
    this.hp = 2;
    this.alive = true;
}

function spawnMinions(number){
    for(i = 0; i < number; i ++) {
        console.log("Sup");
        var div = document.createElement('div');
        div.innerHTML = "";
        div.setAttribute('class', 'minion');
        var lft = parseInt(Math.random() * maxValueLeft);
        var tp = parseInt(Math.random() * maxValueTop);
        div.style.left = String(lft) + 'px';
        div.style.top = String(tp) +'px';
        div.setAttribute("id", "minion" + String(i));
        document.body.appendChild(div);
    }
}

function beginGame(){
    spawnMinions(3);
    var y = $('#player');
    $(".hidden").css("visibility", "visible");
    y.css("visibility", "visible");
    var attackAudio = new Audio('music/attack.mp3');
    myVar = setInterval(function(){
        y.css({
            left: function(index, oldValue) { return calcNewValue(oldValue, 37, 39, maxValueLeft); },
            top: function(index, oldValue) { return calcNewValue(oldValue, 38, 40, maxValueTop); } 
            
        });

        if(keysPressed[32]){
            attackAudio.play();
        }
    }, 20);
    var audio = new Audio('music/adventure_awaits.mp3');
    audio.play();
    document.getElementById("start_box").style.display = 'none';
}


