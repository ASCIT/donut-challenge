var keysPressed = {}, distPerIteration = 5, maxValueLeft = $(window).width();
var myVar, maxValueTop = $(window).height();
var playerWidth = $('#player').width(), playerHeight = $('#player').height();
var minionHp = [];
var minions = [];

$(window).keydown(function(event) { keysPressed[event.which] = true });
$(window).keyup(function(event) { keysPressed[event.which] = false});


function calcNewValue(oldValue, keyCode1, keyCode2, maxValue) {
    var newValue = parseInt(oldValue, 10) 
                   - (keysPressed[keyCode1] ? distPerIteration : 0)
                   + (keysPressed[keyCode2] ? distPerIteration : 0);
    return newValue < 0 ? 0 : newValue > maxValue ? maxValue : newValue
}

function Minion(){
    this.hp = 2;
    this.alive = true;
}

function findCenter(element){
    var height = element.height();
    var width = element.width();
    var top = parseInt(element.css("top"));
    var left = parseInt(element.css("left"));
    return [left + width/2, top + height/2];
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

        minionHp.push(6);
        minions.push(div);
    }
}

function beginGame(){
    var numOfMinions = 6;
    spawnMinions(6);

    var y = $('#player');
    playerWidth = y.width(), playerHeight = y.height();

    $(".hidden").css("visibility", "visible");
    y.css("visibility", "visible");

    var attackAudio = new Audio('music/attack.mp3');
    var damageAudio = new Audio('music/damaged.mp3');
    var cheerAudio = new Audio('music/cheer.mp3')
    myVar = setInterval(function(){
        var center = findCenter($('#player'));
        y.css({
            left: function(index, oldValue) {
                return calcNewValue(oldValue, 37, 39, maxValueLeft - playerWidth); 
            },
            top: function(index, oldValue) { 
                return calcNewValue(oldValue, 38, 40, maxValueTop - playerHeight); 
            } 
        });
        if(keysPressed[32]){
            
            attackAudio.play();
            for (i = 0; i < minions.length; i++) {
                var dist = playerWidth + parseInt(minions[i].offsetWidth);
                var minionCenter = findCenter($('#minion' + i));
                if(distance(minionCenter, center) < dist){
                    minionHp[i] -= 1;
                    damageAudio.play();
                    if(minionHp[i] == 0){
                        $('#minion' + i).css("visibility", "hidden");
                        cheerAudio.play();
                    }
                }
            }
        }
    }, 30);
    var audio = new Audio('music/adventure_awaits.mp3');
    //audio.play();
    document.getElementById("start_box").style.display = 'none';
}

function distance(c1, c2){
    return Math.sqrt((c1[0] - c2[0]) * (c1[0] - c2[0]) + 
            (c1[1] - c2[1]) * (c1[1] - c2[1]));
}
