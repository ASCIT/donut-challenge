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
    var numOfAliveMinions = numOfMinions;
    spawnMinions(numOfMinions);

    var y = $('#player');
    playerWidth = y.width(), playerHeight = y.height();
    var minionWidth = minions[0].offsetWidth;
    var bossWidth = document.getElementById("boss").offsetWidth;

    var bossMode = false;

    $(".hidden").css("visibility", "visible");
    y.css("visibility", "visible");

    var attackAudio = new Audio('music/attack.mp3');
    var damageAudio = new Audio('music/damaged.mp3');
    var cheerAudio = new Audio('music/cheer.mp3')
    var gameOverAudio = new Audio('music/respectfully_resigned.wav');
    var bossAudio = new Audio('music/fantasy_boss.mp3');
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
        if (!bossMode && numOfAliveMinions == 0) {
            adventureAudio.pause();
            bossAudio.play();
            $(".boss").css("visibility", "visible");
            minionWidth = bossWidth;
            minions = [];
            minions.push(document.getElementById("boss"));
            minionHp = [50];
            minionXSpeeds = [7];
            minionYSpeeds = [7];
            bossMode = true;
        }
        if (numOfAliveMinions < 0) {
            $("#victory").css("visibility", "visible");
            adventureAudio.pause();
            bossAudio.pause();
            clearViews();
            clearInterval(refreshId);;
        }
        if(keysPressed[32]){
            attackAudio.play();
            for (i = 0; i < minions.length; i++) {
                var attackDist = playerWidth + minionWidth;
                var minionCenter = findCenter($('#minion' + i));
                if (bossMode) minionCenter = findCenter($("#boss"));
                if(distance(minionCenter, center) < attackDist){
                    minionHp[i] -= 1;
                    if(minionHp[i] >= 0) damageAudio.play();
                    if(minionHp[i] == 0){
                        numOfAliveMinions -= 1;
                        $('#minion' + i).css("visibility", "hidden");
                        if (bossMode) {
                            $('#boss').css("visibility", "hidden");    
                        }
                        cheerAudio.play();
                    }
                }
            }
        }
        var touchDist = (playerWidth + minionWidth)/2;
        for (i = 0; i < minions.length; i ++) {
            var minionCenter = findCenter($('#minion' + i));
            if (bossMode) minionCenter = findCenter($('#boss'));
            if(distance(minionCenter, center) < touchDist && minionHp[i] > 0){
                $('.game_over').css("visibility", "visible")
                adventureAudio.pause();
                bossAudio.pause();
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
    var adventureAudio = new Audio('music/adventure_awaits.mp3');
    adventureAudio.play();
    document.getElementById("start_box").style.display = 'none';
}

function clearViews() {
    $('.minion').css("visibility","hidden");
    $('.hidden').css("visibility","hidden");
    $('.boss').css("visibility", "hidden");
}

function distance(c1, c2){
    return Math.sqrt((c1[0] - c2[0]) * (c1[0] - c2[0]) + 
            (c1[1] - c2[1]) * (c1[1] - c2[1]));
}
