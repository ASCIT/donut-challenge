$(function() {
  var s1 = new Audio('music/adventure_awaits.mp3');
  var s2 = new Audio('music/attack.mp3');
  var s3 = new Audio('music/cheer.mp3');
  var s4 = new Audio('music/damaged.mp3');
  var s5 = new Audio('music/fantasy_boss.mp3');
  var s6 = new Audio('music/fantasy_town.mp3');
  var s7 = new Audio('music/respectfully_resigned.wav');
  s1.loop = true;
  s2.loop = true;
  s3.loop = true;
  s4.loop = true;
  s5.loop = true;
  s6.loop = true;
  s7.loop = true;

  var b1 = document.getElementById("adventure");
  var b2 = document.getElementById("attack");
  var b3 = document.getElementById("cheer");
  var b4 = document.getElementById("damaged");
  var b5 = document.getElementById("fantasy_boss");
  var b6 = document.getElementById("fantasy_town");
  var b7 = document.getElementById("respectfully_resigned");

  b1.addEventListener("click",function(){
    if (s1.paused) {
      b1.style.backgroundColor = "#FE6464";
      s1.play();
    } else {
      b1.style.backgroundColor = "rgb(220,20,60)";
      s1.pause();
    }
  }, false);

  b2.addEventListener("click",function(){
    if (s2.paused) {
      b2.style.backgroundColor = "#FEAB58";
      s2.play();
    } else {
      b2.style.backgroundColor = "#FF4500";
      s2.pause();
    }
  }, false);

  b3.addEventListener("click",function(){
    if (s3.paused) {
      b3.style.backgroundColor = "#F0E68C";
      s3.play();
    } else {
      b3.style.backgroundColor = "#FFD700";
      s3.pause();
    }
  }, false);

  b4.addEventListener("click",function(){
    if (s4.paused) {
      b4.style.backgroundColor = "#90EE90";
      s4.play();
    } else {
      b4.style.backgroundColor = "#228B22";
      s4.pause();
    }
  }, false);
  b5.addEventListener("click",function(){
    if (s5.paused) {
      b5.style.backgroundColor = "#87CEFA";
      s5.play();
    } else {
      b5.style.backgroundColor = "#4169E1";
      s5.pause();
    }
  }, false);
  b6.addEventListener("click",function(){
    if (s6.paused) {
      b6.style.backgroundColor = "#6A5ACD";
      s6.play();
    } else {
      b6.style.backgroundColor = "#483D8B";
      s6.pause();
    }
  }, false);
  b7.addEventListener("click",function(){
    if (s7.paused) {
      b7.style.backgroundColor = "#FFB6C1";
      s7.play();
    } else {
      b7.style.backgroundColor = "#DB7093";
      s7.pause();
    }
  }, false);

  function togglePlay(myAudio) {
    if (myAudio.paused) {
      myAudio.play();
    }
    else {
      myAudio.pause();
    }
  };


});
