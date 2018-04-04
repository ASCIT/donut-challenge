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
  b1.style.backgroundColor = "rgb(220,20,60)";
  b2.style.backgroundColor = "#FF4500";
  b3.style.backgroundColor = "#FFD700";
  b4.style.backgroundColor = "#228B22";
  b5.style.backgroundColor = "#4169E1";
  b6.style.backgroundColor = "#483D8B";
  b7.style.backgroundColor = "#DB7093";

  b1.addEventListener("dblclick", function( event ) {
      if (s1.paused) {
      b1.style.backgroundColor = "#FE6464";
      s1.play();
    } else {
      b1.style.backgroundColor = "rgb(220,20,60)";
      s1.pause();
    }
  }, false);
  b2.addEventListener("dblclick",function(){
    if (s2.paused) {
      b2.style.backgroundColor = "#FEAB58";
      s2.play();
    } else {
      b2.style.backgroundColor = "#FF4500";
      s2.pause();
    }
  }, false);
  b3.addEventListener("dblclick",function(){
    if (s3.paused) {
      b3.style.backgroundColor = "#F0E68C";
      s3.play();
    } else {
      b3.style.backgroundColor = "#FFD700";
      s3.pause();
    }
  }, false);
  b4.addEventListener("dblclick",function(){
    if (s4.paused) {
      b4.style.backgroundColor = "#90EE90";
      s4.play();
    } else {
      b4.style.backgroundColor = "#228B22";
      s4.pause();
    }
  }, false);
  b5.addEventListener("dblclick",function(){
    if (s5.paused) {
      b5.style.backgroundColor = "#87CEFA";
      s5.play();
    } else {
      b5.style.backgroundColor = "#4169E1";
      s5.pause();
    }
  }, false);
  b6.addEventListener("dblclick",function(){
    if (s6.paused) {
      b6.style.backgroundColor = "#ddceff";
      s6.play();
    } else {
      b6.style.backgroundColor = "#483D8B";
      s6.pause();
    }
  }, false);
  b7.addEventListener("dblclick",function(){
    if (s7.paused) {
      b7.style.backgroundColor = "#FFB6C1";
      s7.play();
    } else {
      b7.style.backgroundColor = "#DB7093";
      s7.pause();
    }
  }, false);

  interact('.resize-drag')
  .draggable({
    onmove: window.dragMoveListener,
    restrict: {
      restriction: 'parent',
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
  })
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    // keep the edges inside the parent
    restrictEdges: {
      outer: 'parent',
      endOnly: true,
    },

    // minimum size
    restrictSize: {
      min: { width: 50, height: 50 },
      max: { width: 150, height: 150 },
    },

    inertia: true,
  })
  .on('resizemove', function (event) {
    var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

    // update the element's style
    target.style.width  = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';
    switch (target.id) {
      case "adventure":
        s1.volume = (event.rect.width*event.rect.height)/22500;
        break;
      case "attack":
        s2.volume = (event.rect.width*event.rect.height)/22500;
        break;
      case "cheer":
        s3.volume = (event.rect.width*event.rect.height)/22500;
        break;
      case "damaged":
        s4.volume = (event.rect.width*event.rect.height)/22500;
        break;
      case "fantasy_boss":
        s5.volume = (event.rect.width*event.rect.height)/22500;
        break;
      case "fantasy_town":
        s6.volume = (event.rect.width*event.rect.height)/22500;
        break;
      case "respectfully_resigned":
        s7.volume = (event.rect.width*event.rect.height)/22500;
        break;
    }

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  });
});
