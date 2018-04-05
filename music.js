$(function() {
  var sounds = [];
  var blocks = [];
  var soundNames = ["adventure_awaits", "attack", "cheer", "damaged", "fantasy_boss", "fantasy_town", "respectfully_resigned"];
  var pausedColors = ["#dc143c", "#FF4500", "#FFD700", "#228B22", "#4169E1", "#483D8B", "#DB7093"];
  var playColors = ["#FE6464", "#FEAB58", "#F0E68C", "#90EE90", "#87CEFA", "#ddceff", "#FFB6C1"];

  for (var i = 0; i < 6; i++) {
    sounds[i] = new Audio("music/" + soundNames[i] + ".mp3");
  }
  sounds[6] = new Audio("music/respectfully_resigned.wav");

  for (var i = 0; i < 7; i++) {
    sounds[i].loop = true;
    sounds[i].volume = 2500/22500;
    blocks[i] = document.getElementById(soundNames[i]);
    blocks[i].style.backgroundColor = pausedColors[i];
    blocks[i].addEventListener("dblclick", togglePlay(i));
  }

  function togglePlay(i) {
    return function() {
      if (sounds[i].paused) {
        blocks[i].style.backgroundColor = playColors[i];
        sounds[i].play();
      } else {
        blocks[i].style.backgroundColor = pausedColors[i];
        sounds[i].pause();
      }
    }
  }

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
    for (var i = 0; i < 7; i++) {
      if (target.id === soundNames[i]) {
        sounds[i].volume = (event.rect.width*event.rect.height)/22500;
        break;
      }
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
