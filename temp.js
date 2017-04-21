var keysPressed = {}, distPerIteration = 5, maxValueLeft = $(window).width();
var refreshId, maxValueTop = $(window).height();
var playerWidth = $('#player').width(), playerHeight = $('#player').height();
var minionHp = [], minions = [], minionXSpeeds = [], minionYSpeeds = [];

$(window).keydown(function(event) { keysPressed[event.which] = true });
$(window).keyup(function(event) { keysPressed[event.which] = false});


function calcNewValue(oldValue, keyCode1, keyCode2, maxValue) {
    var newValue = parseInt(oldValue, 10) 
                   - (keysPressed[keyCode1] ? distPerIteration : 0)
                   + (keysPressed[keyCode2] ? distPerIteration : 0);
    return newValue < 0 ? 0 : newValue > maxValue ? maxValue : newValue
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
        minionXSpeeds.push(4);
        minionYSpeeds.push(4);
    }
}

function beginGame(){
    var numOfMinions = 6;
    spawnMinions(numOfMinions);

    var y = $('#player');
    playerWidth = y.width(), playerHeight = y.height();
    var minionWidth = minions[0].offsetWidth;

    $(".hidden").css("visibility", "visible");
    y.css("visibility", "visible");

    var attackAudio = new Audio('music/attack.mp3');
    var damageAudio = new Audio('music/damaged.mp3');
    var cheerAudio = new Audio('music/cheer.mp3')
    var gameOverAudio = new Audio('music/respectfully_resigned.wav');
    refreshId = setInterval(function(){
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
                var attackDist = playerWidth + minionWidth;
                var minionCenter = findCenter($('#minion' + i));
                if(distance(minionCenter, center) < attackDist){
                    minionHp[i] -= 1;
                    if(minionHp[i] >= 0) damageAudio.play();
                    if(minionHp[i] == 0){
                        $('#minion' + i).css("visibility", "hidden");
                        cheerAudio.play();
                    }
                }
            }
        }
        var touchDist = (playerWidth + minionWidth)/2;
        for (i = 0; i < minions.length; i ++) {
            var minionCenter = findCenter($('#minion' + i));
            if(distance(minionCenter, center) < touchDist && minionHp[i] > 0){
                $('.game_over').css("visibility", "visible")
                audio.pause();
                gameOverAudio.play(); 
                clearViews();
                clearInterval(refreshId);
            }
            var newX = minionCenter[0] + minionXSpeeds[i];
            if (newX > maxValueLeft - minionWidth/2) {
                newX = maxValueLeft - minionWidth/2;
                minionXSpeeds[i] = -minionXSpeeds[i];
            }else if (newX < minionWidth/2) {
                newX = minionWidth/2;
                minionXSpeeds[i] = -minionXSpeeds[i];
            }

            var newY = minionCenter[1] + minionYSpeeds[i];
            if (newY > maxValueTop - minionWidth/2) {
                newY = maxValueTop - minionWidth/2;
                minionYSpeeds[i] = -minionYSpeeds[i];
            }else if (newY < minionWidth/2) {
                newY = minionWidth/2;
                minionYSpeeds[i] =- minionYSpeeds[i];
            }
            minions[i].style.left = String(newX - minionWidth/2) + 'px';
            minions[i].style.top = String(newY - minionWidth/2) + 'px';
        }
    }, 30);
    var audio = new Audio('music/adventure_awaits.mp3');
    audio.play();
    document.getElementById("start_box").style.display = 'none';
}

function clearViews() {
    $('.minion').css("visibility","hidden");
    $('.hidden').css("visibility","hidden");
}

function distance(c1, c2){
    return Math.sqrt((c1[0] - c2[0]) * (c1[0] - c2[0]) + 
            (c1[1] - c2[1]) * (c1[1] - c2[1]));
}
